"use client" // якщо ти в App Router
import { useState } from "react"
import axios from "axios"

export default function OTPPage() {
  const [identifier, setIdentifier] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"send" | "verify">("send")

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:9000/auth/customer/otp/generate", {
        identifier,
      })
      setStep("verify")
      alert("OTP sent!")
    } catch (err) {
      console.error(err)
      alert("Failed to send OTP.")
    }
  }

  const handleVerifyOtp = async () => {
    try {
      await axios.post("http://localhost:9000/auth/customer/otp/verify", {
        identifier,
        otp,
      })
      alert("OTP verified!")
      // Тут можна зробити редирект або логін
    } catch (err) {
      console.error(err)
      alert("Invalid OTP.")
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>OTP Verification</h1>
      {step === "send" ? (
        <>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or phone"
            style={{ marginBottom: "1rem", display: "block" }}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            style={{ marginBottom: "1rem", display: "block" }}
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  )
}
