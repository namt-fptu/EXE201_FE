"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

// ✅ Created PaymentFailed component
const PaymentFailed = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation: fade in effect when component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <>
      <Breadcrumb title="Payment Failed" pages={["Payment"]} />
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
              {/* Payment Failed Icon with animation */}
              <div
                className={`relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-red/10 rounded-full mb-8 transform transition-all duration-1000 ease-out ${
                  isVisible ? "scale-100 rotate-0" : "scale-0 rotate-45"
                }`}
              >
                <div className="relative">
                  {/* Warning/Error Icon */}
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-red"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h2
                className={`font-bold text-red text-4xl lg:text-[45px] lg:leading-[57px] mb-5 transform transition-all duration-900 delay-300 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Payment Failed
              </h2>

              <h3
                className={`font-medium text-dark text-xl sm:text-2xl mb-3 transform transition-all duration-900 delay-500 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Oops! Something went wrong
              </h3>

              <p
                className={`max-w-[491px] w-full mx-auto mb-7.5 text-gray-6 leading-relaxed transform transition-all duration-900 delay-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Unfortunately, your payment could not be completed. This could be
                due to insufficient funds, expired card details, or a temporary
                technical issue. Please try again or contact support if the
                problem persists.
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-900 delay-900 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {/* <Link
                  href="/checkout"
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
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v4H4v-4z"
                      fill=""
                    />
                  </svg>
                  Try Again
                </Link> */}

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-gray-6 bg-transparent border border-gray-6 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-6 hover:text-white hover:shadow-lg transform hover:scale-105"
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
                  Go Back Home
                </Link>
              </div>

              {/* Additional support section */}
              <div
                className={`mt-8 pt-8 border-t border-gray-3 transform transition-all duration-900 delay-1100 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h4 className="font-medium text-dark text-lg mb-2">Contact Us</h4>
                <div className="flex flex-col items-center gap-1 text-gray-6 text-sm">
                  <a
                    href="tel:+84397125134"
                    className="hover:text-blue font-medium"
                    aria-label="Call us at (+84) 397125134"
                  >
                    (+84) 397125134
                  </a>
                  <a
                    href="mailto:aidonia2025@gmail.com"
                    className="hover:text-blue font-medium"
                    aria-label="Email us at aidonia2025@gmail.com"
                  >
                    aidonia2025@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentFailed;