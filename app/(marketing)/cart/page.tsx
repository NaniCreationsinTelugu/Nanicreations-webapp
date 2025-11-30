
"use client"
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";


const Cart = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
    
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">Your cart is empty</p>
            <Link href="/collections">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-border bg-card p-4 animate-fade-in"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-lg font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-lg border border-border">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 animate-fade-in">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                <div className="space-y-3 border-b border-border pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">${total.toFixed(2)}</span>
                </div>
                <Button className="mt-6 w-full" size="lg">
                  Proceed to Checkout
                </Button>
                <Link href="/collections">
                  <Button variant="outline" className="mt-3 w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
