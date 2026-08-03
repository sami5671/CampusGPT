"use server";

import apiRoutes from "@/config/api-routes";
import apiClient from "@/lib/api-client";
import { cookies } from "next/headers";

// Unified User Login (handles any role)
export async function handleUserLogin(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = (formData.get("role") as string) || "student";

        if (!email || !password) {
            return { status: false, error: "Email and password are required!" };
        }

        const res = await apiClient(apiRoutes.publicRoutes.signIn, {
            method: "POST",
            body: { email, password, role },
            cache: "no-store",
        });

        // Backend response verification
        if (!res?.status || !res?.data || !res?.data?.token) {
            return {
                status: false,
                error: res?.message || "User is not registered or invalid credentials!",
            };
        }

        const { user, token } = res.data;

        // Save token in cookies
        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return {
            status: true,
            user,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}

// Admin / Moderator Login
export async function handleAdminLogin(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return { status: false, error: "Email and password are required!" };
        }

        const res = await apiClient(apiRoutes.publicRoutes.adminSignIn, {
            method: "POST",
            body: { email, password },
            cache: "no-store",
        });

        // Backend response verification
        if (!res?.status || !res?.data) {
            return {
                status: false,
                error: res?.message || "Invalid credentials!",
            };
        }

        const { user, token } = res.data;

        // Role Validation: Check if the logged-in user is an admin or moderator
        if (user.role !== "admin" && user.role !== "moderator") {
            return {
                status: false,
                error: "Access denied! Authorized administrators only.",
            };
        }

        // Save token in cookies
        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return {
            status: true,
            user,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}

// Student Login
export async function handleStudentLogin(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return { status: false, error: "Email and password are required!" };
        }

        const res = await apiClient(apiRoutes.publicRoutes.adminSignIn, {
            method: "POST",
            body: { email, password },
            cache: "no-store",
        });

        // Backend response verification
        if (!res?.status || !res?.data) {
            return {
                status: false,
                error: res?.message || "Invalid credentials!",
            };
        }

        const { user, token } = res.data;

        // Role Validation: Check if the logged-in user is a student
        if (user.role !== "student") {
            return {
                status: false,
                error: "Access denied! Student portal only.",
            };
        }

        // Save token in cookies
        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return {
            status: true,
            user,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}

// User Logout (Deletes cookie)
export async function handleAdminLogout() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("admin_token");
        return { status: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected logout error occurred!";
        return { status: false, error: errorMessage };
    }
}

// User Registration (Students / Faculty / Staff)
export async function handleRegister(formData: FormData) {
    try {
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const idNumber = formData.get("idNumber") as string;
        const department = (formData.get("department") as string) || "Computer Science & Engineering";
        const role = (formData.get("role") as string) || "student";
        const password = formData.get("password") as string;

        if (!fullName || !email || !idNumber || !password) {
            return { status: false, error: "Full name, email, ID number, and password are required!" };
        }

        const res = await apiClient(apiRoutes.publicRoutes.signUp, {
            method: "POST",
            body: {
                fullName,
                email,
                idNumber,
                department,
                role,
                password,
            },
            cache: "no-store",
        });

        if (!res?.status || !res?.data) {
            return {
                status: false,
                error: res?.message || "Registration failed!",
            };
        }

        const { user, token } = res.data;

        // Save token in cookies
        const cookieStore = await cookies();
        cookieStore.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return {
            status: true,
            user,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}

// Fetch current user from token in cookies
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;

        if (!token) {
            return { status: false, error: "No active session" };
        }

        const res = await apiClient("/auth/me", {
            method: "GET",
            cache: "no-store",
        });

        if (!res?.status || !res?.data) {
            return { status: false, error: res?.message || "Failed to fetch session" };
        }

        return {
            status: true,
            user: res.data.user,
        };
    } catch (error) {
        return { status: false, error: "Unexpected session retrieval error" };
    }
}

// Change Password Action
export async function changePasswordAction(formData: FormData) {
    try {
        const oldPassword = formData.get("oldPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return { status: false, error: "All fields are required!" };
        }

        if (newPassword !== confirmPassword) {
            return { status: false, error: "New password and confirmation do not match!" };
        }

        const res = await apiClient(apiRoutes.privateRoutes.admin.changePassword, {
            method: "PATCH",
            body: { oldPassword, newPassword },
            cache: "no-store",
        });

        if (!res?.status) {
            return {
                status: false,
                error: res?.message || "Failed to change password!",
            };
        }

        return {
            status: true,
            message: res?.message || "Password updated successfully!",
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}

// Update Profile Action
export async function updateProfileAction(formData: FormData) {
    try {
        const res = await apiClient("/user/updateProfile", {
            method: "PATCH",
            body: formData,
            isFormData: true,
            cache: "no-store",
        });

        if (!res?.status || !res?.data) {
            return {
                status: false,
                error: res?.message || "Failed to update profile!",
            };
        }

        return {
            status: true,
            message: res?.message || "Profile updated successfully!",
            user: res.data.user,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred!";
        return { status: false, error: errorMessage };
    }
}
