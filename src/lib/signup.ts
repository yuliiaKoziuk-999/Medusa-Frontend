import createMedusaClient from "@medusajs/medusa-js"
import { setAuthToken, getAuthHeaders } from "./auth-helpers"
import { transferCart } from "./cart-utils"

// Створення клієнта Medusa
const sdk = new createMedusaClient({
  baseUrl:
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000", // чи інший URL твого API
  maxRetries: 3,
})

export async function signup(_currentState: unknown, formData: FormData) {
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
  }

  const otp = formData.get("otp") as string

  try {
    // 1. Реєстрація OTP
    const registrationRes = await sdk.auth.authenticate({
      identifier: customerForm.email,
      otp,
    })

    const registrationToken = registrationRes.token
    await setAuthToken(registrationToken)

    const headers = await getAuthHeaders()

    // 2. Створення кастомера
    const createdCustomer = await sdk.customers.create(customerForm, headers)

    // 3. Автентифікація з тим самим OTP
    const authRes = await sdk.auth.authenticate({
      identifier: customerForm.email,
      otp,
    })

    const authenticationToken = authRes.token
    await setAuthToken(authenticationToken)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}
