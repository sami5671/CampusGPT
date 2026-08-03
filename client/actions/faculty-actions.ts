"use server";

import apiClient from "@/lib/api-client";

export interface FacultyItem {
  id: string;
  name: string;
  department: string;
  designation: string;
  officeRoom: string;
  email: string;
  contactNumber: string;
  officeHours: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyInput {
  name: string;
  department: string;
  designation: string;
  officeRoom: string;
  email: string;
  contactNumber: string;
  officeHours: string;
}

export async function getFacultiesAction() {
  try {
    const res = await apiClient("/faculty", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: [],
        error: res?.message || "Failed to fetch faculty list",
      };
    }

    return {
      status: true,
      data: (res.data as FacultyItem[]) || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: [], error: errorMessage };
  }
}

export async function createFacultyAction(data: FacultyInput) {
  try {
    if (!data.name || !data.department || !data.designation || !data.officeRoom || !data.email || !data.contactNumber || !data.officeHours) {
      return { status: false, error: "All Faculty Information fields are required!" };
    }

    const res = await apiClient("/faculty", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to create faculty member",
      };
    }

    return {
      status: true,
      data: res.data as FacultyItem,
      message: res.message || "Faculty member added successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function updateFacultyAction(id: string, data: Partial<FacultyInput>) {
  try {
    const res = await apiClient(`/faculty/${id}`, {
      method: "PUT",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update faculty member",
      };
    }

    return {
      status: true,
      data: res.data as FacultyItem,
      message: res.message || "Faculty member updated successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function deleteFacultyAction(id: string) {
  try {
    const res = await apiClient(`/faculty/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to delete faculty member",
      };
    }

    return {
      status: true,
      message: res.message || "Faculty member deleted successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
