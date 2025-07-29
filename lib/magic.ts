// This is a placeholder for your authentication client (e.g., Magic.link, Supabase Auth, etc.)
// In a real application, you would initialize your auth client here.
export const magic = {
  user: {
    isLoggedIn: async () => {
      // Check both the flag and if a token exists
      return localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("authToken") !== null
    },
    getMetadata: async () => {
      // Simulate user data based on token presence
      const authToken = localStorage.getItem("authToken")
      if (authToken) {
        return { email: "user@example.com", publicAddress: "0x123abc", authToken: authToken }
      }
      return null
    },
    logout: async () => {
      // Simulate logout
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("authToken")
    },
    // New method to explicitly set login state and token
    setLoggedIn: (status: boolean, token?: string) => {
      if (status) {
        localStorage.setItem("isLoggedIn", "true")
        if (token) {
          localStorage.setItem("authToken", token)
        }
      } else {
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("authToken")
      }
    },
  },
}
