"use server";

import apiClient from "@/lib/api-client";

export interface ClassItem {
  id: string;
  department: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  semester: string;
  buildingName: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  days: string[];
  status: "running" | "end" | "upcoming" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassInput {
  department: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  semester: string;
  buildingName: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  days?: string[];
  status?: string;
}

export async function getClassesAction() {
  try {
    const res = await apiClient("/classes", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: [],
        error: res?.message || "Failed to fetch classes list",
      };
    }

    return {
      status: true,
      data: (res.data as ClassItem[]) || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: [], error: errorMessage };
  }
}

export async function createClassAction(data: ClassInput) {
  try {
    if (
      !data.department ||
      !data.courseCode ||
      !data.courseTitle ||
      !data.instructorName ||
      !data.semester ||
      !data.buildingName ||
      !data.roomNumber ||
      !data.startTime ||
      !data.endTime
    ) {
      return { status: false, error: "All class information fields are required!" };
    }

    const res = await apiClient("/classes", {
      method: "POST",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to create class entry",
      };
    }

    return {
      status: true,
      data: res.data as ClassItem,
      message: res.message || "Class added successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function updateClassAction(id: string, data: Partial<ClassInput>) {
  try {
    const res = await apiClient(`/classes/${id}`, {
      method: "PUT",
      body: data,
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to update class entry",
      };
    }

    return {
      status: true,
      data: res.data as ClassItem,
      message: res.message || "Class updated successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}

export async function deleteClassAction(id: string) {
  try {
    const res = await apiClient(`/classes/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        error: res?.message || "Failed to delete class entry",
      };
    }

    return {
      status: true,
      message: res.message || "Class entry deleted successfully!",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, error: errorMessage };
  }
}
