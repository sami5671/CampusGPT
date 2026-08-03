"use server";

import apiClient from "@/lib/api-client";
import crypto from "crypto";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: "high" | "medium" | "low" | string;
  category?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  priority: "high" | "medium" | "low" | string;
  category?: string;
  imageUrl?: string;
  imageBase64?: string;
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL.
 */
export async function getCloudinaryPublicId(url: string): Promise<string | null> {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1];
    path = path.replace(/^v\d+\//, "");
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    return path || null;
  } catch (e) {
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using Destroy REST API.
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  const publicId = await getCloudinaryPublicId(imageUrl);
  if (!publicId) return false;

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "jnzheux0";
    const apiKey = process.env.CLOUDINARY_API_KEY || "374161283792895";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "Ed-rGQg43YGgdpbJUsfY31iYG5Q";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data?.result === "ok" || data?.result === "not found";
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
    return false;
  }
}

async function uploadToCloudinary(fileData: string): Promise<string> {
  if (fileData.startsWith("http://") || fileData.startsWith("https://")) {
    return fileData;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "jnzheux0";
  const apiKey = process.env.CLOUDINARY_API_KEY || "374161283792895";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "Ed-rGQg43YGgdpbJUsfY31iYG5Q";
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const strToSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data?.secure_url) {
    return data.secure_url;
  } else {
    throw new Error(data?.error?.message || "Failed to upload image to Cloudinary");
  }
}

export async function getAnnouncementsAction() {
  try {
    const res = await apiClient("/announcements", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: [],
        error: res?.message || "Failed to fetch announcements list",
      };
    }

    return {
      status: true,
      data: (res.data as AnnouncementItem[]) || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: [], error: errorMessage };
  }
}

export async function createAnnouncementAction(data: AnnouncementInput) {
  try {
    if (!data.title || !data.content) {
      return { status: false, error: "Title and content are required!" };
    }

    let finalImageUrl = data.imageUrl || "";

    if (data.imageBase64) {
      try {
        finalImageUrl = await uploadToCloudinary(data.imageBase64);
      } catch (err: any) {
        return { status: false, error: `Cloudinary Upload Error: ${err.message}` };
      }
    }

    const res = await apiClient("/announcements", {
      method: "POST",
      body: {
        title: data.title,
        content: data.content,
        priority: data.priority,
        category: data.category || "General",
        imageUrl: finalImageUrl,
      },
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to create announcement",
      };
    }

    return {
      status: true,
      data: res.data as AnnouncementItem,
      message: res.message || "Announcement published successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function updateAnnouncementAction(id: string, data: AnnouncementInput, oldImageUrl?: string) {
  try {
    let finalImageUrl = data.imageUrl || "";
    let newImageUploaded = false;

    if (data.imageBase64) {
      try {
        finalImageUrl = await uploadToCloudinary(data.imageBase64);
        newImageUploaded = true;
      } catch (err: any) {
        return { status: false, error: `Cloudinary Upload Error: ${err.message}` };
      }
    }

    const updatePayload: Record<string, any> = {
      title: data.title,
      content: data.content,
      priority: data.priority,
      category: data.category || "General",
      imageUrl: finalImageUrl,
    };

    const res = await apiClient(`/announcements/${id}`, {
      method: "PUT",
      body: updatePayload,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update announcement",
      };
    }

    // Delete old photo from Cloudinary if a new photo was uploaded or photo was removed
    if ((newImageUploaded || data.imageUrl === "") && oldImageUrl && oldImageUrl !== finalImageUrl) {
      await deleteFromCloudinary(oldImageUrl);
    }

    return {
      status: true,
      data: res.data as AnnouncementItem,
      message: res.message || "Announcement updated successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function deleteAnnouncementAction(id: string, existingImageUrl?: string) {
  try {
    const res = await apiClient(`/announcements/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to delete announcement",
      };
    }

    const targetImageUrl = existingImageUrl || res.data?.imageUrl;
    if (targetImageUrl) {
      await deleteFromCloudinary(targetImageUrl);
    }

    return {
      status: true,
      message: res.message || "Announcement and associated Cloudinary image deleted successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
