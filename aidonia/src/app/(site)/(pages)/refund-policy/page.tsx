'use client';
import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const RefundPolicyPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const sections = [
    {
      id: 1,
      title: "General Policy",
      content: "We want you to be happy with your purchase. If you are not completely satisfied, you may return most new, unopened items within 30 days of delivery for a full refund. We'll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).",
    },
    {
      id: 2,
      title: "Refund Process",
      content: "You should expect to receive your refund within four weeks of giving your package to the return shipper; however, in many cases, you will receive a refund more quickly. This time period includes the transit time for us to receive your return from the shipper (5 to 10 business days), the time it takes us to process your return once we receive it (3 to 5 business days), and the time it takes your bank to process our refund request (5 to 10 business days).",
    },
    {
      id: 3,
      title: "Items Ineligible for Return",
      content: "Certain items are not eligible for return, including: digital downloads, gift cards, and some personal care items. Please check the product description for any special return policies.",
    },
    {
      id: 4,
      title: "How to Initiate a Return",
      content: "If you need to return an item, please contact us with your order number and details about the product you would like to return. We will respond quickly with instructions for how to return items from your order.",
    }
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Breadcrumb title="Refund Policy" pages={["refund-policy"]} />

      <section className="py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
            <div className="space-y-4">
              {sections.map((section, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className="border border-gray-3 rounded-xl overflow-hidden shadow-card-9 hover:shadow-card-8 transition"
                  >
                    <button
                      onClick={() => toggleSection(i)}
                      className="w-full flex items-center justify-between text-left px-6 py-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-custom-xl text-dark">
                            {section.title}
                          </h3>
                        </div>
                      </div>
                      <div
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-screen" : "max-h-0"
                      } overflow-hidden`}
                    >
                      <div className="px-6 pb-5 pl-18">
                        <p className="text-dark-5 leading-relaxed bg-gray-1 p-4 rounded-lg border border-gray-2">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="mt-20 p-10 rounded-2xl bg-primary text-white text-center shadow-lg">
              <h3 className="text-heading-5 font-bold mb-3 text-white">
                Still Have Questions?
              </h3>
              <p className="text-white mb-6 text-custom-lg">
                Can't find what you're looking for? Our support team is always ready to help you.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/contact"
                  className="px-8 py-3 bg-white text-dark rounded-lg font-semibold hover:bg-gray-1 transition shadow-md"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RefundPolicyPage;
