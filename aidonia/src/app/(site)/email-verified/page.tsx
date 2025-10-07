import { EmailVerifiedSuccess } from "@/components/StatusPages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verified Successfully",
  description: "Your email address has been successfully verified. Welcome to our community!",
};

// ✅ Created email verification success page
export default function Page() {
  return <EmailVerifiedSuccess />;
}