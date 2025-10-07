import { PaymentFailed } from "@/components/StatusPages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed",
  description: "Your payment could not be completed. Please try again or contact support.",
};

// ✅ Created payment failed page
export default function Page() {
  return <PaymentFailed />;
}