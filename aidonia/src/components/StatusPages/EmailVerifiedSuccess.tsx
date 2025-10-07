"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

// ✅ Created EmailVerifiedSuccess component
const EmailVerifiedSuccess = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation: fade in effect when component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <>
      <Breadcrumb title="Email Verified" pages={["Email Verification"]} />
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
              {/* Success Icon with animation */}
              <div
                className={`relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green/10 rounded-full mb-8 transform transition-all duration-1000 ease-out ${
                  isVisible ? "scale-100 rotate-0" : "scale-0 rotate-45"
                }`}
              >
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-green"
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

              <h2
                className={`font-bold text-green text-4xl lg:text-[45px] lg:leading-[57px] mb-5 transform transition-all duration-900 delay-300 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Email Verified Successfully!
              </h2>

              <h3
                className={`font-medium text-dark text-xl sm:text-2xl mb-3 transform transition-all duration-900 delay-500 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Welcome to our community!
              </h3>

              <p
                className={`max-w-[491px] w-full mx-auto mb-7.5 text-gray-6 leading-relaxed transform transition-all duration-900 delay-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Your email address has been successfully verified. You can now
                enjoy all features of your account and start exploring our
                amazing products.
              </p>

              <div
                className={`transform transition-all duration-900 delay-900 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Link
                  href="/"
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
                      d="M10 1.66667C7.3595 1.66667 4.82708 2.71667 2.95833 4.58542C1.08958 6.45417 0.833334 8.98667 0.833334 10C0.833334 11.0133 1.08958 13.5458 2.95833 15.4146C4.82708 17.2833 7.3595 18.3333 10 18.3333C12.6405 18.3333 15.1729 17.2833 17.0417 15.4146C18.9104 13.5458 19.1667 11.0133 19.1667 10C19.1667 8.98667 18.9104 6.45417 17.0417 4.58542C15.1729 2.71667 12.6405 1.66667 10 1.66667ZM10 16.6667C5.39583 16.6667 2.5 13.7708 2.5 10C2.5 6.22917 5.39583 3.33333 10 3.33333C14.6042 3.33333 17.5 6.22917 17.5 10C17.5 13.7708 14.6042 16.6667 10 16.6667Z"
                      fill=""
                    />
                    <path
                      d="M10.8333 6.66667L8.33333 8.33333V11.6667L10.8333 13.3333L13.3333 11.6667V8.33333L10.8333 6.66667Z"
                      fill=""
                    />
                  </svg>
                  Go to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EmailVerifiedSuccess;