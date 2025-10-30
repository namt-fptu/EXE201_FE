"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import packageService from "@/services/packageService";
import paymentService from "@/services/paymentService";

interface Package {
  id: number;
  packageName: string; // API returns packageName, not name
  description?: string;
  price: number;
  durationInDays: number; // API returns durationInDays, not duration
  postlimit: number; // API returns postlimit, not maxPosts
  postLimit?: number; // Alternative field name
  maxPriorityPosts?: number;
  status: string;
}

interface PaymentResponse {
  checkoutUrl: string;
  qrCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
}

interface BuyPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: () => void;
}

const BuyPackageModal: React.FC<BuyPackageModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Fetch packages
  useEffect(() => {
    console.log("BuyPackageModal: isOpen changed:", isOpen);
    if (isOpen) {
      console.log("BuyPackageModal: Modal opened, fetching packages...");
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log("BuyPackageModal: Fetching packages...");
      const response = await packageService.getAllPackages();
      console.log("BuyPackageModal: Packages response:", response);

      // Check for both 'success' and 'isSuccess' properties
      if ((response?.success || response?.isSuccess) && response?.data) {
        console.log("BuyPackageModal: Raw packages data:", response.data);

        // Filter only active packages (or packages without status)
        const activePackages = response.data.filter(
          (pkg: Package) => !pkg.status || pkg.status === "Active"
        );

        console.log("BuyPackageModal: Active packages:", activePackages);
        console.log(
          "BuyPackageModal: Setting packages count:",
          activePackages.length
        );
        setPackages(activePackages);
      } else {
        console.log("BuyPackageModal: No packages in response");
        setPackages([]);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handleBuyPackage = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Creating payment link...");

      const response = await paymentService.buyPackage(
        userId,
        selectedPackage.id
      );

      toast.dismiss();

      console.log("Buy package response:", response);

      if ((response?.success || response?.isSuccess) && response?.data) {
        // Check if data is a string URL (direct redirect case)
        if (typeof response.data === 'string') {
          toast.success("Redirecting to payment page...");
          window.location.href = response.data;
          return;
        }
        
        // Otherwise handle as payment data object
        setPaymentData(response.data);
        
        // Redirect to payment URL if available
        if (response.data.checkoutUrl) {
          toast.success("Redirecting to payment page...");
          window.location.href = response.data.checkoutUrl;
        } else {
          // Fallback to showing payment info in modal
          setStep("payment");
        }

        // Start checking payment status if orderCode exists
        if (response.data.orderCode) {
          startPaymentCheck(response.data.orderCode);
        }
      } else {
        toast.error("Failed to create payment link");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error buying package:", error);
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const startPaymentCheck = (orderCode: number) => {
    setCheckingPayment(true);

    // Check payment status every 3 seconds
    const interval = setInterval(async () => {
      try {
        const status = await paymentService.checkPaymentStatus(orderCode);

        if (status?.success && status?.data?.status === "PAID") {
          clearInterval(interval);
          setCheckingPayment(false);
          setStep("success");
          toast.success("Payment successful!");

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000);

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setCheckingPayment(false);
    }, 600000);
  };

  const handleClose = () => {
    setStep("select");
    setSelectedPackage(null);
    setPaymentData(null);
    setCheckingPayment(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-dark">
            {step === "select" && "Choose Your Package"}
            {step === "payment" && "Complete Payment"}
            {step === "success" && "Payment Successful!"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Package */}
          {step === "select" && (
            <div>
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-12 w-12 border-4 border-blue border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading packages...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">No packages available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    console.log(
                      "BuyPackageModal: Rendering packages:",
                      packages
                    );
                    return null;
                  })()}
                  {packages.map((pkg) => {
                    console.log("BuyPackageModal: Rendering package:", pkg);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg)}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                          selectedPackage?.id === pkg.id
                            ? "border-blue bg-blue-50"
                            : "border-gray-200 hover:border-blue hover:shadow-lg"
                        }`}
                      >
                        <h3 className="text-xl font-bold text-dark mb-2">
                          {pkg.packageName}
                        </h3>
                        <div className="text-3xl font-bold text-blue mb-4">
                          {pkg.price.toLocaleString("vi-VN")}₫
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>⏰ Duration: {pkg.durationInDays} days</p>
                          <p>
                            📝 Max Posts: {pkg.postlimit || pkg.postLimit || 0}
                          </p>
                          {pkg.maxPriorityPosts && (
                            <p>⭐ Priority Posts: {pkg.maxPriorityPosts}</p>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="mt-4 text-gray-500 text-sm">
                            {pkg.description}
                          </p>
                        )}
                        {selectedPackage?.id === pkg.id && (
                          <div className="mt-4 text-center">
                            <span className="inline-block bg-blue text-white px-4 py-1 rounded-full text-sm">
                              Selected
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Buy Button */}
              {selectedPackage && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleBuyPackage}
                    disabled={loading}
                    className="bg-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Processing..."
                      : `Buy ${selectedPackage.packageName}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && paymentData && (
            <div className="max-w-md mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-dark mb-4 text-center">
                  Scan QR Code to Pay
                </h3>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-lg mb-4">
                  {paymentData.qrCode ? (
                    <div className="flex justify-center">
                      <img
                        src={paymentData.qrCode}
                        alt="Payment QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">QR Code not available</p>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold">
                      {paymentData.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold">
                      {paymentData.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-blue text-lg">
                      {paymentData.amount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-semibold text-xs">
                      {paymentData.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Code:</span>
                    <span className="font-mono font-semibold">
                      #{paymentData.orderCode}
                    </span>
                  </div>
                </div>

                {checkingPayment && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-blue">
                      <div className="animate-spin h-4 w-4 border-2 border-blue border-t-transparent rounded-full"></div>
                      <span className="text-sm">Waiting for payment...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">🔒 Secure payment via PayOS</p>
                <p>After scanning the QR code and completing payment,</p>
                <p>this dialog will automatically close.</p>
              </div>

              {paymentData.checkoutUrl && (
                <div className="mt-4 text-center">
                  <a
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue hover:underline text-sm"
                  >
                    Open payment page in new tab →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="max-w-md mx-auto text-center py-8">
              <div className="mb-6">
                <svg
                  className="w-20 h-20 mx-auto text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-8">
                Your package has been activated successfully.
                <br />
                You can now enjoy all the benefits!
              </p>
              <button
                onClick={handleClose}
                className="bg-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyPackageModal;
