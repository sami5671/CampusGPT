"use server";

import apiClient from "@/lib/api-client";

export interface RecentActivityItem {
  id: string;
  action: string;
  time: string;
  type: "announcement" | "faculty" | "class" | "template" | string;
  priority?: string;
}

export interface DashboardStatsData {
  totalFaculty: number;
  totalOffices: number;
  totalTemplates: number;
  totalClasses: number;
  runningClasses: number;
  upcomingClasses: number;
  totalAnnouncements: number;
  highPriorityAnnouncements: number;
  recentActivities: RecentActivityItem[];
}

export async function getDashboardStatsAction() {
  try {
    const res = await apiClient("/dashboard/stats", {
      method: "GET",
      cache: "no-store",
    });

    if (!res?.status) {
      return {
        status: false,
        data: null,
        error: res?.message || "Failed to fetch dashboard statistics",
      };
    }

    return {
      status: true,
      data: res.data as DashboardStatsData,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
    return { status: false, data: null, error: errorMessage };
  }
}
