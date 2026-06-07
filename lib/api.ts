const API_URL = getApiUrl()
const TOKEN_STORAGE_KEY = "condoeaseAuthToken"
const USER_STORAGE_KEY = "condoeaseAuthUser"

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "")
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is required.")

  return apiUrl
}

export type ApiUser = {
  _id?: string
  id?: string
  firstName: string
  lastName: string
  email: string
  role: string
  contactNumber?: string
  unitStreet?: string
  barangay?: string
  city?: string
  region?: string
  photoUrl?: string
  approvalStatus?: "Pending" | "Approved" | "Rejected"
}

type AuthResponse = {
  token: string
  user: ApiUser
}

type RequestOptions = RequestInit & {
  auth?: boolean
}

export type ApiListResponse<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  const token = getAuthToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get("content-type")
  const data = contentType?.includes("application/json") ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed")
  }

  return data as T
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function sendOtp(payload: { email: string; purpose: "signup" | "password_reset" }) {
  return apiRequest<{ message: string }>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function verifyOtp(payload: {
  email: string
  purpose: "signup" | "password_reset"
  otp: string
}) {
  return apiRequest<{ message: string }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function resetPasswordWithOtp(payload: {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}) {
  return apiRequest<{ message: string }>("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function registerAccount(payload: Record<string, unknown>) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateProfile(payload: Record<string, unknown>) {
  return apiRequest<{ user: ApiUser }>("/auth/profile", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function updatePassword(payload: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  return apiRequest<{ message: string }>("/auth/password", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser() {
  return apiRequest<{ user: ApiUser }>("/auth/me", { auth: true })
}

export function listRecords<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value))
  }

  const suffix = query.toString() ? `?${query.toString()}` : ""
  return apiRequest<ApiListResponse<T>>(`${path}${suffix}`, { auth: true })
}

export function createRecord<T>(path: string, payload: Record<string, unknown>) {
  return apiRequest<T>(path, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function saveAuthSession(token: string, user: ApiUser) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function saveStoredUser(user: ApiUser) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
}

export function getAuthToken() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? ""
}

export function getStoredUser() {
  if (typeof window === "undefined") return null

  const stored = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as ApiUser
  } catch {
    return null
  }
}
