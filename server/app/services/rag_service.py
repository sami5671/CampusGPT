import os
import re
import html
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.routes.classes import compute_dynamic_status

logger = logging.getLogger(__name__)

def clean_html(text: str) -> str:
    """Strip HTML tags and unescape entities for clean plain text rendering."""
    if not text:
        return ""
    clean = re.sub(r'<[^>]+>', '', str(text))
    clean = html.unescape(clean)
    return clean.strip()

class RAGService:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.doc_texts: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.is_indexed: bool = False

    async def index_all_data(self, db) -> int:
        """Fetch all entity records from MongoDB and build the RAG knowledge index."""
        if db is None:
            logger.warning("RAG Indexer: Database connection unavailable.")
            return 0

        docs = []

        # 1. Index Faculty records
        try:
            faculty_cursor = db["faculty"].find({})
            faculties = await faculty_cursor.to_list(length=1000)
            for f in faculties:
                name = clean_html(f.get("name", "Unknown"))
                dept = clean_html(f.get("department", "General"))
                designation = clean_html(f.get("designation", "Faculty"))
                email = clean_html(f.get("email", "N/A"))
                office = clean_html(f.get("officeRoom", "N/A"))
                hours = clean_html(f.get("officeHours", "N/A"))
                phone = clean_html(f.get("contactNumber", "N/A"))

                text = (
                    f"Faculty Member: {name}. Department: {dept}. Designation: {designation}. "
                    f"Email: {email}. Office Room: {office}. Office Hours: {hours}. Contact Number: {phone}."
                )
                docs.append({
                    "id": str(f.get("_id")),
                    "type": "faculty",
                    "title": f"Faculty: {name}",
                    "content": text,
                    "metadata": f
                })
        except Exception as e:
            logger.error(f"Error indexing faculty records: {e}")

        # 2. Index Classes records
        try:
            class_cursor = db["classes"].find({})
            classes = await class_cursor.to_list(length=1000)
            for c in classes:
                title = clean_html(c.get("courseTitle") or c.get("courseName") or c.get("name") or "Course")
                code = clean_html(c.get("courseCode") or c.get("code") or "")
                instructor = clean_html(c.get("instructorName") or c.get("instructor") or c.get("facultyName") or "N/A")
                bldg = clean_html(c.get("buildingName") or c.get("building") or "")
                room = clean_html(c.get("roomNumber") or c.get("room") or "N/A")
                room_full = f"{bldg} {room}".strip() if bldg else room
                start_t = clean_html(c.get("startTime", ""))
                end_t = clean_html(c.get("endTime", ""))
                time_range = f"{start_t} - {end_t}".strip(" -") if (start_t or end_t) else clean_html(c.get("schedule") or "N/A")
                days_list = c.get("days", [])
                days_str = ", ".join(days_list) if isinstance(days_list, list) and days_list else clean_html(str(c.get("days", "")))
                dept = clean_html(c.get("department") or "")
                sem = clean_html(c.get("semester") or "")

                live_status = compute_dynamic_status(start_t, end_t, days_list if isinstance(days_list, list) else [])

                text = (
                    f"Class Course: {title} ({code}). Semester: {sem}. Department: {dept}. "
                    f"Instructor: {instructor}. Schedule Days: {days_str}. Time: {time_range}. "
                    f"Building & Room: {room_full}. Live Status: {live_status}."
                )
                
                doc_meta = {
                    **c,
                    "clean_courseTitle": title,
                    "clean_courseCode": code,
                    "clean_instructorName": instructor,
                    "clean_room": room_full,
                    "clean_schedule": f"{days_str} ({time_range})" if days_str else time_range,
                    "live_status": live_status
                }

                docs.append({
                    "id": str(c.get("_id")),
                    "type": "class",
                    "title": f"Class: {title} ({code})",
                    "content": text,
                    "metadata": doc_meta
                })
        except Exception as e:
            logger.error(f"Error indexing class records: {e}")

        # 3. Index Announcements records
        try:
            ann_cursor = db["announcements"].find({})
            announcements = await ann_cursor.to_list(length=1000)
            for a in announcements:
                title = clean_html(a.get("title", "Announcement"))
                raw_content = a.get("content") or a.get("description") or ""
                content = clean_html(raw_content)
                category = clean_html(a.get("category", "General"))
                date = a.get("createdAt", "")

                text = f"Announcement Title: {title}. Category: {category}. Details: {content}. Date: {date}."
                doc_meta = {**a, "clean_content": content}
                docs.append({
                    "id": str(a.get("_id")),
                    "type": "announcement",
                    "title": f"Announcement: {title}",
                    "content": text,
                    "metadata": doc_meta
                })
        except Exception as e:
            logger.error(f"Error indexing announcement records: {e}")

        # 4. Index Offices records
        try:
            office_cursor = db["offices"].find({})
            offices = await office_cursor.to_list(length=1000)
            for o in offices:
                name = clean_html(o.get("officeName") or o.get("name") or "Office")
                building = clean_html(o.get("building") or "Campus Building")
                room = clean_html(o.get("room") or "N/A")
                email = clean_html(o.get("email") or "N/A")
                phone = clean_html(o.get("phoneNumber") or o.get("phone") or "N/A")
                hours = clean_html(o.get("officeHours") or o.get("hours") or "N/A")
                map_link = clean_html(o.get("mapLink") or "")

                text = (
                    f"Campus Office: {name}. Building: {building}. Room: {room}. "
                    f"Email: {email}. Phone: {phone}. Operating Hours: {hours}. Map Link: {map_link}."
                )
                docs.append({
                    "id": str(o.get("_id")),
                    "type": "office",
                    "title": f"Office: {name}",
                    "content": text,
                    "metadata": o
                })
        except Exception as e:
            logger.error(f"Error indexing office records: {e}")

        # 5. Index Application Templates records
        try:
            temp_cursor = db["application_templates"].find({})
            templates = await temp_cursor.to_list(length=1000)
            for t in templates:
                name = clean_html(t.get("templateName") or t.get("name") or "Application Template")
                desc = clean_html(t.get("description", ""))
                image_url = clean_html(t.get("imageUrl", ""))

                text = (
                    f"Application Template: {name}. Description: {desc}. Download or Preview Link: {image_url}."
                )
                docs.append({
                    "id": str(t.get("_id")),
                    "type": "template",
                    "title": f"Template: {name}",
                    "content": text,
                    "metadata": t
                })
        except Exception as e:
            logger.error(f"Error indexing application template records: {e}")

        self.documents = docs
        self.doc_texts = [d["content"] for d in docs]

        if self.doc_texts:
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(self.doc_texts)
            self.is_indexed = True
            logger.info(f"RAG Indexer successfully indexed {len(docs)} documents.")
        else:
            self.is_indexed = False
            logger.info("RAG Indexer: No documents found in database.")

        return len(docs)

    def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top_k most relevant document contexts for a user query."""
        if not self.is_indexed or not self.documents:
            return []

        query_lower = query.lower()
        role_keywords = ["head", "chairman", "chair", "dean", "director", "coordinator", "associate head"]
        is_role_query = any(k in query_lower for k in role_keywords)

        # Smart filter for role queries (e.g., "head of software department")
        if is_role_query:
            matched_roles = []
            for doc in self.documents:
                if doc["type"] == "faculty":
                    meta = doc["metadata"]
                    designation = str(meta.get("designation", "")).lower()
                    dept = str(meta.get("department", "")).lower()

                    if any(k in designation for k in role_keywords):
                        dept_clean = dept.replace("department of", "").replace("department", "").strip()
                        dept_tokens = [t for t in dept_clean.split() if len(t) > 2]

                        dept_match = any(dt in query_lower for dt in dept_tokens) or (
                            ("software" in query_lower or "swe" in query_lower) and ("software" in dept or "swe" in dept)
                        ) or (
                            "cse" in query_lower and "cse" in dept
                        ) or (
                            "cis" in query_lower and "cis" in dept
                        ) or (
                            "bba" in query_lower and ("bba" in dept or "business" in dept)
                        ) or (
                            "law" in query_lower and "law" in dept
                        ) or (
                            "english" in query_lower and "english" in dept
                        )

                        known_depts = ["software", "swe", "cse", "cis", "eee", "bba", "law", "english", "textile", "pharmacy"]
                        has_specific_dept_in_query = any(d in query_lower for d in known_depts)

                        if dept_match or not has_specific_dept_in_query:
                            item = doc.copy()
                            item["score"] = 0.99
                            matched_roles.append(item)

            if matched_roles:
                return matched_roles[:3]

        # Standard TF-IDF vector retrieval with name boosting
        if self.vectorizer and self.tfidf_matrix is not None:
            try:
                query_vec = self.vectorizer.transform([query])
                similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

                name_matched_indices = set()
                # Boost scores for exact name matches
                for i, doc in enumerate(self.documents):
                    if doc["type"] == "faculty":
                        name_words = doc["metadata"].get("name", "").lower().split()
                        for w in name_words:
                            clean_w = w.strip(".,()")
                            if len(clean_w) > 3 and clean_w in query_lower:
                                similarities[i] += 0.40
                                name_matched_indices.add(i)
                    elif doc["type"] == "template":
                        meta = doc["metadata"]
                        t_name = str(meta.get("templateName") or meta.get("name") or "").lower()
                        t_desc = str(meta.get("description", "")).lower()
                        generic_template_terms = {
                            "application", "applications", "template", "templates", "form", "forms",
                            "doc", "document", "download", "pdf", "file", "paper", "link", "please",
                            "give", "me", "show", "want", "need", "get", "for", "the", "a", "an", "is",
                            "of", "to", "in", "can", "how", "what", "where", "i", "my", "your", "help",
                            "any", "all", "list", "available", "there", "are", "do", "you", "have"
                        }
                        for word in query_lower.split():
                            clean_w = word.strip(".,()?!\"'")
                            if len(clean_w) > 2 and clean_w not in generic_template_terms:
                                if clean_w in t_name:
                                    similarities[i] += 0.50
                    elif doc["type"] == "office":
                        meta = doc["metadata"]
                        o_name = str(meta.get("officeName") or meta.get("name") or "").lower()
                        o_bldg = str(meta.get("building", "")).lower()
                        generic_office_terms = {
                            "office", "offices", "directory", "directories", "location", "locations",
                            "building", "buildings", "room", "rooms", "contact", "contacts", "map",
                            "maps", "email", "phone", "hours", "timing", "time", "where", "is", "the",
                            "a", "an", "for", "in", "at", "details", "info", "information", "please",
                            "give", "me", "show", "want", "need", "get", "can", "how", "what", "i",
                            "my", "your", "help", "any", "all", "list", "available", "there", "are",
                            "do", "you", "have", "manage", "official"
                        }
                        for word in query_lower.split():
                            clean_w = word.strip(".,()?!\"'")
                            if len(clean_w) > 2 and clean_w not in generic_office_terms:
                                if clean_w in o_name:
                                    similarities[i] += 0.50
                                elif clean_w in o_bldg:
                                    similarities[i] += 0.25

                top_indices = np.argsort(similarities)[::-1][:top_k]

                results = []
                for idx in top_indices:
                    score = float(similarities[idx])
                    if score > 0.12:  # Relevancy threshold
                        item = self.documents[idx].copy()
                        item["score"] = score
                        results.append(item)

                # Filter out unrelated non-faculty documents when query is specifically about a person
                if name_matched_indices and results:
                    faculty_matches = [r for r in results if r["type"] == "faculty" and r["score"] >= 0.35]
                    intent_keywords = ["announcement", "notice", "news", "class", "schedule", "office", "routine"]
                    if faculty_matches and not any(k in query_lower for k in intent_keywords):
                        return faculty_matches[:2]

                # Strict Intent Segregation & Entity Filtering
                office_intent_keywords = {"office", "offices", "directory", "directories", "building", "buildings", "room", "rooms", "map", "maps", "location", "locations"}
                template_intent_keywords = {"template", "templates", "application", "applications", "form", "forms", "download"}
                class_intent_keywords = {"class", "classes", "routine", "routines", "schedule", "schedules", "running", "course", "courses", "timetable", "timings", "lecture", "lectures", "lab", "labs", "today"}

                is_office_query = any(k in query_lower for k in office_intent_keywords)
                is_template_query = any(k in query_lower for k in template_intent_keywords)
                is_class_query = any(k in query_lower for k in class_intent_keywords)

                query_tokens = [w.strip(".,()?!\"'") for w in query_lower.split() if len(w.strip(".,()?!\"'")) > 2]

                # STRICT RULE 1: If query is specifically about Class Routine / Schedule / Running Classes:
                if is_class_query and not is_office_query and not is_template_query:
                    results = [r for r in results if r["type"] not in ["office", "template"]]
                    is_running_query = any(k in query_lower for k in ["running", "live", "current", "now"])

                    all_classes = []
                    for doc in self.documents:
                        if doc["type"] == "class":
                            c_meta = doc["metadata"]
                            start_t = c_meta.get("startTime", "")
                            end_t = c_meta.get("endTime", "")
                            days_list = c_meta.get("days", [])
                            live_st = compute_dynamic_status(start_t, end_t, days_list if isinstance(days_list, list) else [])
                            doc["metadata"]["live_status"] = live_st

                            match_score = 0
                            if is_running_query and live_st == "running":
                                match_score += 5

                            c_title = str(c_meta.get("courseTitle") or c_meta.get("clean_courseTitle") or "").lower()
                            c_code = str(c_meta.get("courseCode") or "").lower()
                            c_instructor = str(c_meta.get("instructorName") or "").lower()
                            c_dept = str(c_meta.get("department") or "").lower()

                            for token in query_tokens:
                                if len(token) > 2 and token not in class_intent_keywords:
                                    if token in c_code:
                                        match_score += 4
                                    elif token in c_title:
                                        match_score += 3
                                    elif token in c_instructor:
                                        match_score += 2
                                    elif token in c_dept:
                                        match_score += 1

                            item = doc.copy()
                            item["score"] = 0.85 + (match_score * 0.05)
                            all_classes.append((item, match_score, live_st))

                    if all_classes:
                        if is_running_query:
                            running_matches = [c[0] for c in all_classes if c[2] == "running"]
                            if running_matches:
                                return running_matches

                        max_score = max(c[1] for c in all_classes)
                        if max_score > 0:
                            best_classes = [c[0] for c in all_classes if c[1] == max_score]
                            return best_classes

                        all_classes_sorted = sorted(all_classes, key=lambda x: (0 if x[2] == "running" else 1))
                        return [c[0] for c in all_classes_sorted]

                    if not any(r["type"] == "class" for r in results):
                        all_class_docs = [doc for doc in self.documents if doc["type"] == "class"]
                        if all_class_docs:
                            return all_class_docs

                    return results

                # STRICT RULE 2: If query is specifically about an Office Directory / Office:
                if is_office_query and not is_template_query:
                    results = [r for r in results if r["type"] != "template"]

                    generic_office_terms = {
                        "office", "offices", "directory", "directories", "location", "locations",
                        "building", "buildings", "room", "rooms", "contact", "contacts", "map",
                        "maps", "email", "phone", "hours", "timing", "time", "where", "is", "the",
                        "a", "an", "for", "in", "at", "details", "info", "information", "please",
                        "give", "me", "show", "want", "need", "get", "can", "how", "what", "i",
                        "my", "your", "help", "any", "all", "list", "available", "there", "are",
                        "do", "you", "have", "manage", "official", "campus"
                    }
                    office_topic_words = [w for w in query_tokens if w not in generic_office_terms]

                    if office_topic_words:
                        all_office_matches = []
                        for doc in self.documents:
                            if doc["type"] == "office":
                                meta = doc["metadata"]
                                o_name = str(meta.get("officeName") or meta.get("name") or "").lower()
                                o_bldg = str(meta.get("building", "")).lower()

                                match_score = 0
                                for word in office_topic_words:
                                    if word in o_name:
                                        match_score += 3
                                    elif word in o_bldg:
                                        match_score += 1

                                if match_score > 0:
                                    item = doc.copy()
                                    item["score"] = 0.90 + (match_score * 0.05)
                                    all_office_matches.append((item, match_score))

                        if all_office_matches:
                            max_match_score = max(m[1] for m in all_office_matches)
                            best_offices = [m[0] for m in all_office_matches if m[1] == max_match_score]
                            results = best_offices

                    # If no specific office matched, return all offices
                    if not any(r["type"] == "office" for r in results):
                        all_offices = [doc for doc in self.documents if doc["type"] == "office"]
                        if all_offices:
                            results = all_offices

                    # Enforce strict removal of any template documents
                    results = [r for r in results if r["type"] != "template"]
                    return results

                # STRICT RULE 3: If query is specifically about an Application Template:
                if is_template_query and not is_office_query:
                    results = [r for r in results if r["type"] != "office"]

                    generic_template_terms = {
                        "application", "applications", "template", "templates", "form", "forms",
                        "doc", "document", "download", "pdf", "file", "paper", "link", "please",
                        "give", "me", "show", "want", "need", "get", "for", "the", "a", "an", "is",
                        "of", "to", "in", "can", "how", "what", "where", "i", "my", "your", "help",
                        "any", "all", "list", "available", "there", "are", "do", "you", "have", "campus"
                    }
                    specific_topic_words = [w for w in query_tokens if w not in generic_template_terms]

                    if specific_topic_words:
                        all_template_matches = []
                        for doc in self.documents:
                            if doc["type"] == "template":
                                meta = doc["metadata"]
                                t_name = str(meta.get("templateName") or meta.get("name") or "").lower()
                                t_desc = str(meta.get("description", "")).lower()

                                match_score = 0
                                for word in specific_topic_words:
                                    if word in t_name:
                                        match_score += 3
                                    elif word in t_desc:
                                        match_score += 1

                                if match_score > 0:
                                    item = doc.copy()
                                    item["score"] = 0.90 + (match_score * 0.05)
                                    all_template_matches.append((item, match_score))

                        if all_template_matches:
                            max_match_score = max(m[1] for m in all_template_matches)
                            best_templates = [m[0] for m in all_template_matches if m[1] == max_match_score]
                            results = best_templates

                    # Enforce strict removal of any office documents
                    results = [r for r in results if r["type"] != "office"]
                    return results

                return results
            except Exception as e:
                logger.error(f"Error during context retrieval: {e}")
                return []

        return []

    async def generate_response(self, query: str, db) -> Dict[str, Any]:
        """Generate RAG response for user message."""
        # Always re-index from MongoDB to guarantee client-server sync with latest data
        if db is not None:
            await self.index_all_data(db)

        relevant_docs = self.retrieve_context(query, top_k=5)

        # Check for OpenAI API key
        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        if openai_key and relevant_docs:
            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                context_str = "\n".join([f"- {d['content']}" for d in relevant_docs])
                prompt = (
                    f"You are CampusGPT, an intelligent campus AI assistant.\n"
                    f"Use ONLY the following verified campus information to answer the user request:\n\n"
                    f"{context_str}\n\n"
                    f"User Query: {query}\n\n"
                    f"Provide a friendly, helpful, and concise response."
                )
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
                answer = response.choices[0].message.content
                return {
                    "answer": answer,
                    "sources": [d["title"] for d in relevant_docs],
                    "method": "openai_rag"
                }
            except Exception as e:
                logger.error(f"OpenAI API call failed, falling back: {e}")

        if gemini_key and relevant_docs:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                context_str = "\n".join([f"- {d['content']}" for d in relevant_docs])
                prompt = (
                    f"You are CampusGPT, an intelligent campus AI assistant.\n"
                    f"Answer the user query using the following campus database information:\n\n"
                    f"{context_str}\n\n"
                    f"User Query: {query}"
                )
                res = model.generate_content(prompt)
                return {
                    "answer": res.text,
                    "sources": [d["title"] for d in relevant_docs],
                    "method": "gemini_rag"
                }
            except Exception as e:
                logger.error(f"Gemini API call failed, falling back: {e}")

        # Local Smart Synthesis (100% Free, no external key needed)
        if relevant_docs:
            source_titles = list(set([d["title"] for d in relevant_docs]))
            formatted_chunks = []
            query_lower = query.lower()
            is_head_query = any(k in query_lower for k in ["head", "chairman", "chair", "dean", "director"])

            if is_head_query:
                relevant_docs = relevant_docs[:1]

            for d in relevant_docs:
                meta = d["metadata"]
                if d["type"] == "faculty":
                    formatted_chunks.append(
                        f"👨‍🏫 **{meta.get('name')}** ({meta.get('designation', 'Faculty')})\n"
                        f"• **Department**: {meta.get('department')}\n"
                        f"• **Email**: {meta.get('email')}\n"
                        f"• **Office Room**: {meta.get('officeRoom', 'N/A')}\n"
                        f"• **Office Hours**: {meta.get('officeHours', 'N/A')}\n"
                        f"• **Contact**: {meta.get('contactNumber', 'N/A')}"
                    )
                elif d["type"] == "class":
                    c_title = meta.get("clean_courseTitle") or meta.get("courseTitle") or meta.get("courseName") or "Course"
                    c_code = meta.get("clean_courseCode") or meta.get("courseCode") or ""
                    c_instructor = meta.get("clean_instructorName") or meta.get("instructorName") or meta.get("instructor") or "N/A"
                    c_schedule = meta.get("clean_schedule") or meta.get("schedule") or "N/A"
                    c_room = meta.get("clean_room") or f"{meta.get('buildingName', '')} {meta.get('roomNumber', '')}".strip() or "N/A"
                    c_dept = meta.get("department") or "General"
                    c_status = meta.get("live_status") or "upcoming"

                    status_badge = "🟢 Running Now" if c_status == "running" else ("⏳ Upcoming" if c_status == "upcoming" else "🔴 Class Ended")
                    code_str = f" ({c_code})" if c_code else ""

                    formatted_chunks.append(
                        f"📚 **{c_title}**{code_str}\n"
                        f"• **Status**: {status_badge}\n"
                        f"• **Instructor**: {c_instructor}\n"
                        f"• **Schedule & Time**: {c_schedule}\n"
                        f"• **Room / Building**: {c_room}\n"
                        f"• **Department**: {c_dept}"
                    )
                elif d["type"] == "announcement":
                    ann_text = meta.get("clean_content") or clean_html(meta.get("content") or meta.get("description", ""))
                    formatted_chunks.append(
                        f"📢 **{meta.get('title')}** [{meta.get('category', 'General')}]\n"
                        f"• {ann_text}"
                    )
                elif d["type"] == "office":
                    off_name = meta.get('officeName') or meta.get('name') or 'Office'
                    off_bldg = meta.get('building') or 'Campus Building'
                    off_room = meta.get('room') or 'N/A'
                    off_map = meta.get('mapLink') or f"https://www.google.com/maps/search/?api=1&query={off_name.replace(' ', '+')}+{off_bldg.replace(' ', '+')}"
                    formatted_chunks.append(
                        f"🏢 **{off_name}**\n"
                        f"• **Building**: {off_bldg} (Room {off_room})\n"
                        f"• **Email**: {meta.get('email', 'N/A')}\n"
                        f"• **Hours**: {meta.get('officeHours') or meta.get('hours', 'N/A')}\n"
                        f"• **Map Location**: {off_map}"
                    )
                elif d["type"] == "template":
                    formatted_chunks.append(
                        f"📄 **{meta.get('templateName', 'Application Template')}**\n"
                        f"• **Description**: {meta.get('description', 'N/A')}\n"
                        f"• **Preview/Download**: {meta.get('imageUrl', 'N/A')}"
                    )

            if is_head_query and len(relevant_docs) > 0 and relevant_docs[0]["type"] == "faculty":
                head_meta = relevant_docs[0]["metadata"]
                header_intro = f"The **{head_meta.get('designation', 'Department Head').strip()}** of **{head_meta.get('department').strip()}** is **{head_meta.get('name').strip()}**:\n\n"
            elif any(d["type"] == "class" for d in relevant_docs):
                has_running = any(d.get("metadata", {}).get("live_status") == "running" for d in relevant_docs)
                if any(k in query_lower for k in ["running", "live", "now"]):
                    if has_running:
                        header_intro = "🟢 **Live Class Update**: Here are the classes currently running on campus:\n\n"
                    else:
                        header_intro = "ℹ️ **No classes are running right now**. Here is the upcoming class schedule:\n\n"
                else:
                    header_intro = "📚 Here is the class schedule and routine information from our campus database:\n\n"
            elif len(relevant_docs) == 1 and relevant_docs[0]["type"] == "template":
                temp_meta = relevant_docs[0]["metadata"]
                t_name = temp_meta.get('templateName') or temp_meta.get('name') or 'Application Template'
                header_intro = f"Here is the official **{t_name}** form you requested:\n\n"
            elif len(relevant_docs) == 1 and relevant_docs[0]["type"] == "office":
                off_meta = relevant_docs[0]["metadata"]
                o_name = off_meta.get('officeName') or off_meta.get('name') or 'Campus Office'
                header_intro = f"Here are the details and location map for the official **{o_name}**:\n\n"
            else:
                header_intro = "Here is the relevant information found from our campus database:\n\n"

            synthesis = (
                header_intro +
                "\n\n".join(formatted_chunks) +
                f"\n\n*Feel free to ask more questions about faculty members, class schedules, application templates, or campus offices!*"
            )

            return {
                "answer": synthesis,
                "sources": source_titles,
                "method": "local_rag_synthesis"
            }

        # Fallback if no matching records found in database
        total_docs = len(self.documents)
        clean_query = clean_html(query)
        if total_docs == 0:
            fallback_msg = (
                "📂 **Campus Database Currently Empty**\n\n"
                "I searched our university database, but no official records (faculty members, class schedules, offices, or application templates) have been added yet.\n\n"
                "💡 **What you can do:**\n"
                "• Administrators can add official campus records via the **Admin Portal**.\n"
                "• As soon as data is added, I will instantly index it and answer student questions!"
            )
        else:
            fallback_msg = (
                f"🔍 **No Matching Campus Record Found**\n\n"
                f"I searched **{total_docs}** verified records in our university database, but couldn't find any data matching **\"{clean_query}\"**.\n\n"
                "💡 **Try these helpful search tips:**\n"
                "• **Check Spelling**: Make sure professor names, course codes, or office titles are spelled correctly.\n"
                "• **Use Keywords**: Search using terms like *\"Software Engineering\"*, *\"CSE Department\"*, *\"Room 402\"*, or *\"Leave Application\"*.\n"
                "• **Explore Database Topics**:\n"
                "  - 👨‍🏫 **Faculty Directory**: Professor contacts, office rooms, and office hours.\n"
                "  - 📚 **Class Schedules**: Timings, course codes, and room locations.\n"
                "  - 🏢 **Campus Offices**: Administrative desks, floor locations, and emails.\n"
                "  - 📄 **Application Forms**: Sample templates and downloadable documents.\n\n"
                "✨ *Tip: Try asking: \"Show me faculty members in Computer Science\" or \"Where is the Registrar Office?\"*"
            )

        return {
            "answer": fallback_msg,
            "sources": [],
            "method": "fallback"
        }

rag_service = RAGService()
