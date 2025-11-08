import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- Promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              Aidonia Campus Deals
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              BUY & SELL STUDENT ITEMS EASILY
            </h2>

            <p>
              Explore hundreds of pre-loved student items — books, electronics,
              furniture, clothes, and more. Safe, fast, and friendly transactions
              designed for student life.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              Explore Now
            </a>
          </div>

              <Image
            src="/images/promo/aidonia-main.png"
            alt="Aidonia promo"
            className="absolute top-1/2 -translate-y-1/2 right-8 lg:right-16 xl:right-24 -z-1"
            width={300}
            height={350}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- Promo banner small 1 --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#DBF4F3] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 flex items-center">
            <Image
              src="/images/promo/books.png"
              alt="Books promo"
              className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-8 -z-1 opacity-80"
              width={180}
              height={180}
            />

            <div className="ml-auto text-right max-w-[280px]">
              <span className="block text-lg text-dark mb-1.5 font-medium">
                BookZone
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Used Books – Student Prices 📚
              </h2>

              <p className="font-semibold text-custom-1 text-teal mb-4">
                Up to 50% OFF for students
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark"
              >
                Shop Now
              </a>
            </div>
          </div>

          {/* <!-- Promo banner small 2 --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-[#FFECE1] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 flex items-center">
            <div className="max-w-[280px]">
              <span className="block text-lg text-dark mb-1.5 font-medium">
                ReWear Store
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Up to <span className="text-orange">40%</span> OFF
              </h2>

              <p className="text-custom-sm mb-4">
                Trendy, clean, and affordable second-hand clothes — perfect for
                fashion-loving students.
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark"
              >
                View Now
              </a>
            </div>
            
            <Image
              src="/images/promo/clothes.png"
              alt="Clothes promo"
              className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 -z-1 opacity-80"
              width={180}
              height={180}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
