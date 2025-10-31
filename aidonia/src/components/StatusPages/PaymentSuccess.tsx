"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

// ✅ Created PaymentSuccess component
const PaymentSuccess = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation: fade in effect when component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <>
      <Breadcrumb title="Payment Success" pages={["Payment"]} />
      <section className="overflow-hidden py-20 bg-gray-2 min-h-screen flex items-center">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div
            className={`bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25 transform transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center">
              {/* Payment Success Icon with animation */}
              <div
                className={`relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green/10 rounded-full mb-8 transform transition-all duration-1000 ease-out ${
                  isVisible ? "scale-100 rotate-0" : "scale-0 rotate-45"
                }`}
              >
                <div className="relative">
                  {/* Credit Card Icon */}
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-green absolute -top-1 -left-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v4H4v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {/* Check Mark */}
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-green absolute bottom-0 right-0 bg-white rounded-full p-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2
                className={`font-bold text-green text-4xl lg:text-[45px] lg:leading-[57px] mb-5 transform transition-all duration-900 delay-300 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Payment Successful!
              </h2>

              <h3
                className={`font-medium text-dark text-xl sm:text-2xl mb-3 transform transition-all duration-900 delay-500 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Thank you for your purchase!
              </h3>

              <p
                className={`max-w-[491px] w-full mx-auto mb-7.5 text-gray-6 leading-relaxed transform transition-all duration-900 delay-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Your payment has been processed successfully. Your order is now
                being prepared and will be on its way soon. You will receive an
                email confirmation shortly.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-900 delay-900 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Link
                  href="/my-account?tab=history"
                  className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark hover:shadow-lg transform hover:scale-105"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33333 3.33333V1.66667C3.33333 1.20833 3.70833 0.833333 4.16667 0.833333C4.625 0.833333 5 1.20833 5 1.66667V3.33333H15V1.66667C15 1.20833 15.375 0.833333 15.8333 0.833333C16.2917 0.833333 16.6667 1.20833 16.6667 3.33333V3.33333H18.3333C19.25 3.33333 20 4.08333 20 5V16.6667C20 17.5833 19.25 18.3333 18.3333 18.3333H1.66667C0.75 18.3333 0 17.5833 0 16.6667V5C0 4.08333 0.75 3.33333 1.66667 3.33333H3.33333ZM1.66667 6.66667V16.6667H18.3333V6.66667H1.66667Z"
                      fill=""
                    />
                  </svg>
                  View Payment History
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-blue bg-transparent border border-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue hover:text-white hover:shadow-lg transform hover:scale-105"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.6654 9.37502C17.0105 9.37502 17.2904 9.65484 17.2904 10C17.2904 10.3452 17.0105 10.625 16.6654 10.625H8.95703L8.95703 15C8.95703 15.2528 8.80476 15.4807 8.57121 15.5774C8.33766 15.6742 8.06884 15.6207 7.89009 15.442L2.89009 10.442C2.77288 10.3247 2.70703 10.1658 2.70703 10C2.70703 9.83426 2.77288 9.67529 2.89009 9.55808L7.89009 4.55808C8.06884 4.37933 8.33766 4.32586 8.57121 4.42259C8.80475 4.51933 8.95703 4.74723 8.95703 5.00002L8.95703 9.37502H16.6654Z"
                      fill=""
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;