import React, { useState } from "react";
import { toast } from "sonner";

const Discount = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const validCoupons = {
    "SAVE10": { discount: 10, description: "10% off your order" },
    "WELCOME20": { discount: 20, description: "20% off for new customers" },
    "FREESHIP": { discount: 0, description: "Free shipping" },
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast.warning("Please enter a coupon code", {
        duration: 3000,
      });
      return;
    }

    setIsApplying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
      
      if (coupon) {
        setAppliedCoupon(couponCode.toUpperCase());
        toast.success("Coupon applied successfully!", {
          duration: 3000,
          description: coupon.description,
        });
        setCouponCode("");
      } else {
        toast.error("Invalid coupon code", {
          duration: 3000,
          description: "Please check your code and try again",
        });
      }
    } catch (error) {
      toast.error("Failed to apply coupon", {
        duration: 3000,
        description: "Please try again",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed", {
      duration: 2000,
    });
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApplyCoupon}>
        {/* <!-- coupon box --> */}
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="">Have any discount code?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Coupon Applied: {appliedCoupon}</p>
                      <p className="text-sm text-green-600">
                        {validCoupons[appliedCoupon as keyof typeof validCoupons]?.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 xl:gap-5.5">
                <div className="max-w-[426px] w-full">
                  <input
                    type="text"
                    name="coupon"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code (try SAVE10, WELCOME20, FREESHIP)"
                    disabled={isApplying}
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isApplying}
                  className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Apply Code
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Hint for demo coupons */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Demo coupons:</strong> SAVE10 (10% off), WELCOME20 (20% off), FREESHIP (Free shipping)
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
