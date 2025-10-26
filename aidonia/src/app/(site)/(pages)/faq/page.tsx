'use client';
import React, { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb"; // Using shared breadcrumb

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqCategories = [
    {
      category: "General",
      icon: "ℹ️",
      color: "blue", // This will be mapped to theme colors
      faqs: [
        {
          question: "What is Aidonia?",
          answer:
            "Aidonia is a modern e-commerce platform designed to provide a seamless shopping experience. We offer a wide range of products from various categories, ensuring quality and customer satisfaction.",
        },
        {
          question: "How do I create an account?",
          answer:
            'To create an account, click on the "Sign Up" button at the top right corner of the homepage. Fill in your details, and you will be ready to start shopping.',
        },
      ],
    },
    {
      category: "Orders & Payments",
      icon: "💳",
      color: "green",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept various payment methods, including credit/debit cards (Visa, MasterCard, American Express), PayPal, and other digital payment options. All transactions are secure and encrypted.",
        },
        {
          question: "How can I track my order?",
          answer:
            "Once your order is shipped, you will receive an email with a tracking number and a link to the courier's website. You can use this information to track the status of your delivery.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      icon: "🔄",
      color: "purple",
      faqs: [
        {
          question: "What is your return policy?",
          answer:
            "We have a 30-day return policy for most items. If you are not satisfied with your purchase, you can return it within 30 days for a full refund or exchange. Please refer to our Refund Policy page for more details.",
        },
      ],
    },
  ];

  const allFaqs = faqCategories.flatMap((cat, catIndex) =>
    cat.faqs.map((faq, faqIndex) => ({
      ...faq,
      category: cat.category,
      icon: cat.icon,
      color: cat.color,
      globalIndex: catIndex * 10 + faqIndex,
    }))
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Breadcrumb title="Frequently Asked Questions" pages={["faq"]} />

      <section className="py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
            {/* Category Tabs */}
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              {faqCategories.map((cat, idx) => (
                <button
                  key={idx}
                  className="px-5 py-2 rounded-lg border border-primary-200 bg-primary-50 text-dark hover:bg-primary-100 font-medium transition"
                >
                  <span className="mr-1">{cat.icon}</span> {cat.category}{" "}
                  <span className="ml-1 text-xs px-2 py-0.5 bg-white border border-primary-200 rounded-full text-dark">
                    {cat.faqs.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-4">
              {allFaqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className="border border-gray-3 rounded-xl overflow-hidden shadow-card-9 hover:shadow-card-8 transition"
                  >
                    <button
                      onClick={() => toggleFAQ(i)}
                      className="w-full flex items-center justify-between text-left px-6 py-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-custom-xl text-dark">
                            {faq.icon} {faq.question}
                          </h3>
                          <p className="text-sm text-dark-5 mt-1">
                            {faq.category}
                          </p>
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
                        isOpen ? "max-h-96" : "max-h-0"
                      } overflow-hidden`}
                    >
                      <div className="px-6 pb-5 pl-18">
                        <p className="text-dark-5 leading-relaxed bg-gray-1 p-4 rounded-lg border border-gray-2">
                          {faq.answer}
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
                <a
                  href="#"
                  className="px-8 py-3 border border-white/50 text-white rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;