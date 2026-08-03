import { cookies } from "next/headers";

type FetchOptions<TBody> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  tags?: string[];
  cache?: RequestCache;
  isFormData?: boolean;
  revalidate?: number | false;
  credentials?: RequestCredentials;
};

export type ApiResponse<TData = any> = { data: TData | null; status: boolean; message: string; statusCode: number };

async function apiClient<TResponse = any, TBody = undefined>(
  url: string,
  options: FetchOptions<TBody> = {}
): Promise<ApiResponse<TResponse>> {
  const { method = "GET", body, isFormData = false, cache, revalidate } = options;

  try {
    let token: string | undefined = undefined;
    
    // Read token from cookies
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_token")?.value;
    } catch (e) {
      console.warn("Cookies not available in this context:", e);
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: isFormData ? (body as any) : body ? JSON.stringify(body) : undefined,
      cache,
    };

    if (revalidate !== undefined) {
      (fetchOptions as any).next = { revalidate };
    }

    const res = await fetch(`${baseURL}${url}`, fetchOptions);

    const data = await res.json();

    if (!res.ok || data?.status === false) {
      return {
        data: null,
        status: false,
        message: data?.message || data?.detail || "Request failed",
        statusCode: res.status !== 200 ? res.status : (data?.statusCode || 400),
      };
    }

    return {
      data: data?.data !== undefined ? data.data : data,
      status: true,
      message: data?.message || "Success",
      statusCode: res.status,
    };
  } catch (error: any) {
    return {
      data: null,
      status: false,
      message: error.message || "Unexpected error",
      statusCode: 500,
    };
  }
}

export default apiClient;
