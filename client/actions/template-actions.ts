"use server";

import apiClient from "@/lib/api-client";
import crypto from "crypto";

export interface TemplateItem {
  id: string;
  templateName: string;
  imageUrl: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateInput {
  templateName: string;
  imageUrl?: string;
  imageBase64?: string;
  description?: string;
}

/**
 * Extracts Cloudinary public_id from a Cloudinary URL.
 * e.g. "https://res.cloudinary.com/jnzheux0/image/upload/v1722600000/sample.jpg" -> "sample"
 * e.g. "https://res.cloudinary.com/jnzheux0/image/upload/v1722600000/folder/sample.png" -> "folder/sample"
 */
export async function getCloudinaryPublicId(url: string): Promise<string | null> {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let path = parts[1];
    // Remove version prefix if present (e.g. v1722600000/)
    path = path.replace(/^v\d+\//, "");
    // Remove file extension
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
 * Deletes an image from Cloudinary using the Admin/Destroy API endpoint.
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

    // SHA-1 signature: public_id={publicId}&timestamp={timestamp}{apiSecret}
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

export async function getTemplatesAction() {
  try {
    const res = await apiClient("/templates", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: [],
        error: res?.message || "Failed to fetch application templates",
      };
    }

    return {
      status: true,
      data: (res.data as TemplateItem[]) || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: [], error: errorMessage };
  }
}

export async function createTemplateAction(data: TemplateInput) {
  try {
    if (!data.templateName) {
      return { status: false, error: "Template Name is required!" };
    }

    let finalImageUrl = data.imageUrl || "";

    if (data.imageBase64) {
      try {
        finalImageUrl = await uploadToCloudinary(data.imageBase64);
      } catch (err: any) {
        return { status: false, error: `Cloudinary Upload Error: ${err.message}` };
      }
    }

    if (!finalImageUrl) {
      return { status: false, error: "Template picture image is required!" };
    }

    const res = await apiClient("/templates", {
      method: "POST",
      body: {
        templateName: data.templateName,
        imageUrl: finalImageUrl,
        description: data.description || "",
      },
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to create application template",
      };
    }

    return {
      status: true,
      data: res.data as TemplateItem,
      message: res.message || "Application template uploaded and saved successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function updateTemplateAction(id: string, data: TemplateInput, oldImageUrl?: string) {
  try {
    let finalImageUrl = data.imageUrl;
    let newImageUploaded = false;

    if (data.imageBase64) {
      try {
        finalImageUrl = await uploadToCloudinary(data.imageBase64);
        newImageUploaded = true;
      } catch (err: any) {
        return { status: false, error: `Cloudinary Upload Error: ${err.message}` };
      }
    }

    const updatePayload: Record<string, any> = {};
    if (data.templateName) updatePayload.templateName = data.templateName;
    if (finalImageUrl) updatePayload.imageUrl = finalImageUrl;
    if (data.description !== undefined) updatePayload.description = data.description;

    const res = await apiClient(`/templates/${id}`, {
      method: "PUT",
      body: updatePayload,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update application template",
      };
    }

    // Delete old picture from Cloudinary if a new picture was uploaded and old image url exists
    if (newImageUploaded && oldImageUrl && oldImageUrl !== finalImageUrl) {
      await deleteFromCloudinary(oldImageUrl);
    }

    return {
      status: true,
      data: res.data as TemplateItem,
      message: res.message || "Application template updated successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function deleteTemplateAction(id: string, existingImageUrl?: string) {
  try {
    const res = await apiClient(`/templates/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to delete application template",
      };
    }

    const targetImageUrl = existingImageUrl || res.data?.imageUrl;
    if (targetImageUrl) {
      await deleteFromCloudinary(targetImageUrl);
    }

    return {
      status: true,
      message: res.message || "Application template and Cloudinary picture deleted successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
