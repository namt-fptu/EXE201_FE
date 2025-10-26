'use client';
import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const PrivacyPolicyPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const sections = [
    {
      id: 1,
      title: "Introduction",
      content:
        "Welcome to Aidonia. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.",
    },
    {
      id: 2,
      title: "Collection of Your Information",
      content:
        "We may collect information about you in a variety of ways. The information we may collect on the Site includes personal data, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.",
    },
    {
      id: 3,
      title: "Use of Your Information",
      content:
        "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to create and manage your account, email you regarding your account or order, fulfill and manage purchases, orders, payments, and other transactions related to the Site, and increase the efficiency and operation of the Site.",
    },
    {
      id: 4,
      title: "Disclosure of Your Information",
      content:
        "We may share information we have collected about you in certain situations. Your information may be disclosed as follows: by law or to protect rights, if we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.",
    },
    {
      id: 5,
      title: "Security of Your Information",
      content:
        "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.",
    },
    {
      id: 6,
      title: "Contact Us",
      content:
        "If you have questions or comments about this Privacy Policy, please contact us through the contact form on our Contact Us page.",
    },
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Breadcrumb title="Privacy Policy" pages={["privacy-policy"]} />

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

export default PrivacyPolicyPage;
