"use client"
import { createContext, useContext, useEffect, useReducer } from "react"

type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: number;
  variantOptions?: string;
}
type CartState = { items: CartItem[] }
type Action =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "remove"; id: number; variantId?: number }
  | { type: "update"; id: number; variantId?: number; quantity: number }
  | { type: "set"; state: CartState }
  | { type: "clear" } // Explicit clear action usually better

const CartContext = createContext<{ state: CartState; dispatch: React.Dispatch<Action> } | null>(null)

function reducer(state: CartState, action: Action): CartState {
  if (action.type === "add") {
    const qty = action.quantity ?? 1
    // Find existing item matching ID AND VariantID
    const existingIndex = state.items.findIndex(i =>
      i.id === action.item.id && i.variantId === action.item.variantId
    )

    if (existingIndex > -1) {
      const newItems = [...state.items];
      newItems[existingIndex].quantity += qty;
      return { items: newItems };
    }
    return { items: [...state.items, { ...action.item, quantity: qty }] }
  }
  if (action.type === "remove") {
    return { items: state.items.filter(i => !(i.id === action.id && i.variantId === action.variantId)) }
  }
  if (action.type === "update") {
    return {
      items: state.items.map(i =>
        (i.id === action.id && i.variantId === action.variantId)
          ? { ...i, quantity: Math.max(1, action.quantity) }
          : i
      )
    }
  }
  if (action.type === "set") {
    return action.state
  }
  if (action.type === "clear") { // Handle clear action if I decide to use it
    return { items: [] }
  }
  return state
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("cart") : null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartState
        dispatch({ type: "set", state: parsed })
      } catch { }
    }
  }, [])
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cart", JSON.stringify(state))
    }
  }, [state])
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("CartProvider missing")
  const { state, dispatch } = ctx
  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => dispatch({ type: "add", item, quantity })
  const removeItem = (id: number, variantId?: number) => dispatch({ type: "remove", id, variantId })
  const updateQuantity = (id: number, quantity: number, variantId?: number) => dispatch({ type: "update", id, variantId, quantity })
  const clear = () => dispatch({ type: "set", state: { items: [] } })
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
  return { items: state.items, addItem, removeItem, updateQuantity, clear, subtotal }
}
