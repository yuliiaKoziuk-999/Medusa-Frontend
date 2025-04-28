"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/medusa-sdk"
import { useRegion } from "./region"

type CartContextType = {
  cart?: HttpTypes.StoreCart
  addToCart: (
    variantId: string,
    quantity: number
  ) => Promise<HttpTypes.StoreCart>
  updateCart: (data: {
    updateData?: HttpTypes.StoreUpdateCart
    shippingMethodData?: HttpTypes.StoreAddCartShippingMethods
  }) => Promise<HttpTypes.StoreCart | undefined>
  refreshCart: () => Promise<HttpTypes.StoreCart | undefined>
  updateItemQuantity: (
    itemId: string,
    quantity: number
  ) => Promise<HttpTypes.StoreCart>
  unsetCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

type CartProviderProps = {
  children: React.ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<HttpTypes.StoreCart>()
  const { region } = useRegion()

  const refreshCart = async (): Promise<HttpTypes.StoreCart | undefined> => {
    if (!region) return
    const { cart: newCart } = await sdk.carts.create({ region_id: region.id })
    localStorage.setItem("cart_id", newCart.id)
    setCart(newCart)
    return newCart
  }

  const addToCart = async (variantId: string, quantity: number) => {
    if (!cart) throw new Error("Cart not initialized")

    const { cart: updatedCart } = await sdk.carts.lineItems.create(cart.id, {
      variant_id: variantId,
      quantity,
    })
    setCart(updatedCart)
    return updatedCart
  }

  const updateCart = async ({
    updateData,
    shippingMethodData,
  }: {
    updateData?: HttpTypes.StoreUpdateCart
    shippingMethodData?: HttpTypes.StoreAddCartShippingMethods
  }) => {
    if (!cart) return

    let updated = cart

    if (updateData) {
      const { cart: newCart } = await sdk.carts.update(cart.id, updateData)
      updated = newCart
    }

    if (shippingMethodData) {
      const { cart: newCart } = await sdk.carts.addShippingMethod(
        cart.id,
        shippingMethodData
      )
      updated = newCart
    }

    setCart(updated)
    return updated
  }

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!cart) throw new Error("Cart not initialized")

    const { cart: updatedCart } = await sdk.carts.lineItems.update(
      cart.id,
      itemId,
      { quantity }
    )
    setCart(updatedCart)
    return updatedCart
  }

  const unsetCart = () => {
    localStorage.removeItem("cart_id")
    setCart(undefined)
  }

  useEffect(() => {
    if (!region) return

    const cartId = localStorage.getItem("cart_id")

    if (cartId) {
      sdk.carts
        .retrieve(cartId, {
          fields:
            "+items.variant.*,+items.variant.options.*,+items.variant.options.option.*",
        })
        .then(({ cart: dataCart }) => {
          setCart(dataCart)
        })
        .catch(() => {
          refreshCart()
        })
    } else {
      refreshCart()
    }
  }, [region])

  useEffect(() => {
    if (!cart || !region || cart.region_id === region.id) return

    sdk.carts
      .update(cart.id, { region_id: region.id })
      .then(({ cart: updatedCart }) => {
        setCart(updatedCart)
      })
  }, [region])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCart,
        refreshCart,
        updateItemQuantity,
        unsetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
