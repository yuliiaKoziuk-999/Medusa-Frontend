// Зберігає токен в localStorage (можеш адаптувати під cookie, якщо Next.js SSR)
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Отримує заголовки з токеном авторизації
export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    return {
      Authorization: `Bearer ${token}`,
    }
  }
  return { Authorization: "" }
}
