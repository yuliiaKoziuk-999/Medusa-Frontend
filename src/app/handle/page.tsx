import { Router } from "@/components/Route"
import React from "react"

type Params = {
  params: { handle: string }
}

export default function ExpressCheckoutPage({ params }: Params) {
  const handle = params.handle

  return <Router handle={handle} />
}
