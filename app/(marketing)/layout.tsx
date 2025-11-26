import type { PropsWithChildren } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const MarketingLayout = ({ children }: PropsWithChildren) => {
  return (
    <div >
      <Navbar />
      <main >
        {children}
      </main>
      <Footer />
       <WhatsAppButton />
    </div>
  );
};

export default MarketingLayout;