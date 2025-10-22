import { EmailVerifiedSuccess } from "@/components/StatusPages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verified",
  description:
    "Your email address has been successfully verified. Welcome to Aidonia!",
};

// ✅ Created email verification success page
export default function Page() {
  return <EmailVerifiedSuccess />;
}
