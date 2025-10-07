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
                <Link
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
                </Link>

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
                <h4 className="font-medium text-dark text-lg mb-2">
                  Need Help?
                </h4>
                <p className="text-gray-6 text-sm mb-4">
                  If you continue to experience issues, please contact our
                  support team.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-medium text-blue hover:text-blue-dark ease-out duration-200"
                >
                  <svg
                    className="fill-current"
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.125 13.75V16.25C18.125 17.0456 17.4706 17.7 16.675 17.7H3.325C2.52938 17.7 1.875 17.0456 1.875 16.25V13.75C1.875 13.4738 2.09875 13.25 2.375 13.25C2.65125 13.25 2.875 13.4738 2.875 13.75V16.25C2.875 16.4931 3.08188 16.7 3.325 16.7H16.675C16.9181 16.7 17.125 16.4931 17.125 16.25V13.75C17.125 13.4738 17.3488 13.25 17.625 13.25C17.9012 13.25 18.125 13.4738 18.125 13.75Z"
                      fill=""
                    />
                    <path
                      d="M10 2.25C10.2762 2.25 10.5 2.47375 10.5 2.75V11.4394L13.0581 8.88125C13.2581 8.68125 13.5825 8.68125 13.7825 8.88125C13.9825 9.08125 13.9825 9.40563 13.7825 9.60563L10.3619 13.0262C10.2619 13.1262 10.1312 13.1769 10 13.1769C9.86875 13.1769 9.73813 13.1262 9.63813 13.0262L6.2175 9.60563C6.0175 9.40563 6.0175 9.08125 6.2175 8.88125C6.4175 8.68125 6.74188 8.68125 6.94188 8.88125L9.5 11.4394V2.75C9.5 2.47375 9.72375 2.25 10 2.25Z"
                      fill=""
                    />
                  </svg>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentFailed;