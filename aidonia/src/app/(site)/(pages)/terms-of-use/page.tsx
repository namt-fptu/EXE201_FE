'use client';
import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

const TermsOfUsePage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const sections = [
    {
      id: 1,
      title: "Agreement to Terms",
      content: "By using our website, you agree to be bound by these Terms of Use. If you do not agree to these terms, you may not use the website. We may modify these terms at any time, and such modifications shall be effective immediately upon posting the modified terms on the site.",
    },
    {
      id: 2,
      title: "Intellectual Property Rights",
      content: "The content on our website, including text, graphics, logos, and images, is the property of Aidonia or its content suppliers and is protected by copyright and other intellectual property laws. You may not use any content from our website without our express written permission.",
    },
    {
      id: 3,
      title: "Prohibited Activities",
      content: "You are prohibited from using the site to engage in any activity that is illegal, harmful, or otherwise objectionable. This includes, but is not limited to, transmitting any material that is defamatory, obscene, or fraudulent; interfering with the security of the site; and attempting to gain unauthorized access to any part of the site.",
    },
    {
      id: 4,
      title: "Limitation of Liability",
      content: "In no event shall Aidonia, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.",
    },
    {
      id: 5,
      title: "Governing Law",
      content: "These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions.",
    }
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Breadcrumb title="Terms of Use" pages={["terms-of-use"]} />

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

export default TermsOfUsePage;
