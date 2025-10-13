import { PaymentSuccess } from "@/components/StatusPages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your payment has been processed successfully. Thank you for your purchase!",
};

// ✅ Created payment success page
export default function Page() {
  return <PaymentSuccess />;
}