import type { PropsWithChildren } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const MarketingLayout = ({ children }: PropsWithChildren) => {
  return (
    <ToastProvider>
      <CartProvider>
        <div>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <Toaster />
        </div>
      </CartProvider>
    </ToastProvider>
  );
};

export default MarketingLayout;
