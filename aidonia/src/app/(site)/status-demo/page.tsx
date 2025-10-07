import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

// ✅ Created demo page to test all status pages
export default function StatusDemoPage() {
  return (
    <>
      <Breadcrumb title="Status Pages Demo" pages={["Demo"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-dark text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Status Pages Demo
              </h2>
              <p className="max-w-[600px] w-full mx-auto mb-10 text-gray-6 leading-relaxed">
                Click on the links below to preview the different status pages that have been created for your application.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Email Verified Success */}
                <div className="bg-green/5 border border-green/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-dark mb-2">Email Verified</h3>
                  <p className="text-gray-6 text-sm mb-4">Success page after email verification</p>
                  <Link
                    href="/email-verified"
                    className="inline-flex items-center gap-2 font-medium text-green hover:text-green-dark transition-colors"
                  >
                    View Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Payment Success */}
                <div className="bg-blue/5 border border-blue/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v4H4v-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-dark mb-2">Payment Success</h3>
                  <p className="text-gray-6 text-sm mb-4">Success page after successful payment</p>
                  <Link
                    href="/payment-success"
                    className="inline-flex items-center gap-2 font-medium text-blue hover:text-blue-dark transition-colors"
                  >
                    View Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Payment Failed */}
                <div className="bg-red/5 border border-red/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-dark mb-2">Payment Failed</h3>
                  <p className="text-gray-6 text-sm mb-4">Error page when payment fails</p>
                  <Link
                    href="/payment-failed"
                    className="inline-flex items-center gap-2 font-medium text-red hover:text-red-dark transition-colors"
                  >
                    View Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}