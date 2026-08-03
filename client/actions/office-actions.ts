"use server";

import apiClient from "@/lib/api-client";

export interface OfficeItem {
  id: string;
  officeName: string;
  building: string;
  floor: string;
  room: string;
  phoneNumber: string;
  email: string;
  officeHours: string;
  mapLink: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficeInput {
  officeName: string;
  building: string;
  floor: string;
  room: string;
  phoneNumber: string;
  email: string;
  officeHours: string;
  mapLink?: string;
}

export async function getOfficesAction() {
  try {
    const res = await apiClient("/offices", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: [],
        error: res?.message || "Failed to fetch office directory",
      };
    }

    return {
      status: true,
      data: (res.data as OfficeItem[]) || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: [], error: errorMessage };
  }
}

export async function createOfficeAction(data: OfficeInput) {
  try {
    if (
      !data.officeName ||
      !data.building ||
      !data.floor ||
      !data.room ||
      !data.phoneNumber ||
      !data.email ||
      !data.officeHours
    ) {
      return { status: false, error: "All office information fields are required!" };
    }

    const res = await apiClient("/offices", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to add office directory entry",
      };
    }

    return {
      status: true,
      data: res.data as OfficeItem,
      message: res.message || "Office directory entry added successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function updateOfficeAction(id: string, data: Partial<OfficeInput>) {
  try {
    const res = await apiClient(`/offices/${id}`, {
      method: "PUT",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update office entry",
      };
    }

    return {
      status: true,
      data: res.data as OfficeItem,
      message: res.message || "Office entry updated successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function deleteOfficeAction(id: string) {
  try {
    const res = await apiClient(`/offices/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to delete office entry",
      };
    }

    return {
      status: true,
      message: res.message || "Office entry deleted successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
