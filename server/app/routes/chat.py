import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from bson import ObjectId

from app.core.database import get_database
from app.core.deps import get_current_user, get_optional_user
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])

class ChatQueryRequest(BaseModel):
    message: str = Field(..., description="User prompt or question for Campus AI Assistant")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for thread persistence")

def format_conversation_summary(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", "Untitled Chat"),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", "")
    }

@router.post("/query")
@router.post("/query/")
async def chat_query(
    payload: ChatQueryRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Process student/user query through RAG knowledge retrieval and AI assistant engine.
    Persists chat conversation history to MongoDB when user is authenticated.
    """
    query_text = payload.message.strip()
    if not query_text:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": False,
                "data": None,
                "message": "Message content cannot be empty",
                "statusCode": 400
            }
        )

    db = get_database()
    try:
        result = await rag_service.generate_response(query_text, db)
        now_str = datetime.utcnow().isoformat()
        conv_id = payload.conversation_id

        # Persist conversation if user is logged in
        if current_user and db is not None:
            user_id = str(current_user["_id"])
            conversations_col = db["conversations"]

            user_msg = {
                "sender": "user",
                "content": query_text,
                "timestamp": now_str
            }

            assistant_msg = {
                "sender": "assistant",
                "content": result["answer"],
                "timestamp": now_str,
                "sources": result.get("sources", [])
            }

            if conv_id:
                try:
                    obj_id = ObjectId(conv_id)
                    existing_conv = await conversations_col.find_one({"_id": obj_id, "user_id": user_id})
                    if existing_conv:
                        await conversations_col.update_one(
                            {"_id": obj_id},
                            {
                                "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
                                "$set": {"updatedAt": now_str}
                            }
                        )
                    else:
                        conv_id = None
                except Exception:
                    conv_id = None

            if not conv_id:
                # Create a new conversation document
                title = query_text[:35] + ("..." if len(query_text) > 35 else "")
                new_doc = {
                    "user_id": user_id,
                    "title": title,
                    "messages": [user_msg, assistant_msg],
                    "createdAt": now_str,
                    "updatedAt": now_str
                }
                res = await conversations_col.insert_one(new_doc)
                conv_id = str(res.inserted_id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": True,
                "data": {
                    "answer": result["answer"],
                    "sources": result.get("sources", []),
                    "method": result.get("method", "rag"),
                    "conversation_id": conv_id
                },
                "message": "Response generated successfully",
                "statusCode": 200
            }
        )
    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": False,
                "data": None,
                "message": f"Failed to generate response: {str(e)}",
                "statusCode": 500
            }
        )

@router.get("/conversations")
@router.get("/conversations/")
async def get_user_conversations(current_user: dict = Depends(get_current_user)):
    """
    Get all chat conversation summaries for the current logged-in user.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": [], "message": "Database unavailable", "statusCode": 503}
        )

    user_id = str(current_user["_id"])
    cursor = db["conversations"].find({"user_id": user_id}).sort("updatedAt", -1)
    convs = await cursor.to_list(length=200)

    summaries = [format_conversation_summary(c) for c in convs]
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": True, "data": summaries, "message": "Conversations fetched", "statusCode": 200}
    )

@router.get("/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get full message history of a specific chat conversation.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    try:
        obj_id = ObjectId(conversation_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid conversation ID format", "statusCode": 400}
        )

    user_id = str(current_user["_id"])
    conv = await db["conversations"].find_one({"_id": obj_id, "user_id": user_id})
    if not conv:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "Conversation not found", "statusCode": 404}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {
                "id": str(conv["_id"]),
                "title": conv.get("title", "Untitled Chat"),
                "messages": conv.get("messages", []),
                "createdAt": conv.get("createdAt", ""),
                "updatedAt": conv.get("updatedAt", "")
            },
            "message": "Conversation retrieved",
            "statusCode": 200
        }
    )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a chat conversation.
    """
    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    try:
        obj_id = ObjectId(conversation_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid conversation ID format", "statusCode": 400}
        )

    user_id = str(current_user["_id"])
    result = await db["conversations"].delete_one({"_id": obj_id, "user_id": user_id})

    if result.deleted_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "Conversation not found", "statusCode": 404}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": True, "data": {"id": conversation_id}, "message": "Conversation deleted", "statusCode": 200}
    )

class UpdateConversationRequest(BaseModel):
    title: str = Field(..., description="New custom title for the chat conversation")

@router.patch("/conversations/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    payload: UpdateConversationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Rename a chat conversation title.
    """
    new_title = payload.title.strip()
    if not new_title:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Title cannot be empty", "statusCode": 400}
        )

    db = get_database()
    if db is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": False, "data": None, "message": "Database unavailable", "statusCode": 503}
        )

    try:
        obj_id = ObjectId(conversation_id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": False, "data": None, "message": "Invalid conversation ID format", "statusCode": 400}
        )

    user_id = str(current_user["_id"])
    now_str = datetime.utcnow().isoformat()

    result = await db["conversations"].update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": {"title": new_title, "updatedAt": now_str}}
    )

    if result.matched_count == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"status": False, "data": None, "message": "Conversation not found", "statusCode": 404}
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": True,
            "data": {"id": conversation_id, "title": new_title, "updatedAt": now_str},
            "message": "Conversation renamed successfully",
            "statusCode": 200
        }
    )

@router.post("/sync-index")
@router.post("/sync-index/")
async def sync_rag_index():
    """
    Force re-indexing of all MongoDB collections for the RAG service.
    """
    db = get_database()
    try:
        count = await rag_service.index_all_data(db)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": True,
                "data": {"indexed_count": count},
                "message": f"Successfully indexed {count} campus documents",
                "statusCode": 200
            }
        )
    except Exception as e:
        logger.error(f"Error syncing RAG index: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": False,
                "data": None,
                "message": f"Index sync failed: {str(e)}",
                "statusCode": 500
            }
        )
