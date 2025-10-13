"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/axios";
import { toast } from "sonner";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { handleApiResponse, handleApiError, showLoadingToast, showSuccessToast, showErrorToast, showInfoToast, MultiStepToastHandler } from "@/utils/toast-helper";

const VerifyEmailPage = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setMessage(
          "Verification token is missing. Please check your email link."
        );
        showErrorToast("Verification token missing", {
          description: "Please check your email link and try again"
        });
        setIsVerifying(false);
        return;
      }

      // Initialize multi-step verification process
      const toastHandler = new MultiStepToastHandler([
        "Validating verification token...",
        "Connecting to email service...",
        "Verifying your email address...",
        "Activating account features..."
      ]);

      try {
        // Step 1: Validate token
        toastHandler.startStep(0);
        toastHandler.completeStep(0, "Token validated successfully");
        
        // Step 2: Connect to service
        toastHandler.startStep(1);
        toastHandler.completeStep(1, "Connected to verification service");
        
        // Step 3: Verify email
        toastHandler.startStep(2);
        const response = await api.get(`emails/verify`, {
          params: { token },
        });

        // Handle the API response comprehensively
        handleApiResponse(response, {
          successMessage: "Email verification successful!",
          errorMessage: "Email verification failed",
          context: "verify email",
          showDataInfo: false
        });

        if (response.data?.isSuccess && response.data?.data) {
          toastHandler.completeStep(2, "Email address verified successfully");
          
          // Step 4: Activate features
          toastHandler.startStep(3);
          setVerificationStatus("success");
          setMessage(
            "Email verified successfully! You can now enjoy all features."
          );
          
          toastHandler.complete("Email verification complete! Redirecting to your account...");

          // Redirect to account page after 3 seconds
          setTimeout(() => {
            router.push("/my-account");
          }, 3000);
        } else {
          toastHandler.cleanup();
          setVerificationStatus("error");
          setMessage(
            response.data?.message ||
              "Email verification failed. The link may be expired or invalid."
          );
          
          showErrorToast("Email verification failed", {
            description: response.data?.message || "The verification link may be expired or invalid"
          });
        }
      } catch (error) {
        console.error("Email verification error:", error);
        toastHandler.cleanup();
        
        setVerificationStatus("error");
        setMessage(
          "Email verification failed. Please try again or contact support."
        );
        
        // Use comprehensive error handling
        handleApiError(error, {
          context: 'verify email',
          customMessage: "Email verification failed",
          showDetails: true
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendVerification = async () => {
    // This would need user email - you might want to add an email input field
    showInfoToast(
      "Redirecting to account settings",
      {
        description: "You can resend verification email from your account settings"
      }
    );
    router.push("/my-account");
  };

  return (
    <>
      <Breadcrumb title="Email Verification" pages={["email verification"]} />

      <section className="overflow-hidden py-20 bg-gray-2 min-h-screen">
        <div className="max-w-[570px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-8 text-center">
            {isVerifying ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue"></div>
                </div>
                <h2 className="text-2xl font-semibold text-dark mb-4">
                  Verifying Your Email
                </h2>
                <p className="text-dark-4">
                  Please wait while we verify your email address...
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  {verificationStatus === "success" ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <h2
                  className={`text-2xl font-semibold mb-4 ${
                    verificationStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {verificationStatus === "success"
                    ? "Email Verified!"
                    : "Verification Failed"}
                </h2>

                <p className="text-dark-4 mb-6">{message}</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {verificationStatus === "success" ? (
                    <button
                      onClick={() => router.push("/my-account")}
                      className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Go to My Account
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleResendVerification}
                        className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                      >
                        Resend Verification
                      </button>
                      <button
                        onClick={() => router.push("/")}
                        className="inline-flex font-medium text-dark bg-gray-1 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-200"
                      >
                        Go Home
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default VerifyEmailPage;
