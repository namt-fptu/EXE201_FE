"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";

// Import Swiper styles

import Image from "next/image";

const HeroCarousal = () => {
  const router = useRouter();
  const { user } = useUserStore();

  const handleGetStarted = () => {
    if (!user) {
      router.push("/signin");
    } else {
      router.push("/shop-with-sidebar");
    }
  };

  const handleVisitFacebook = () => {
    window.open(
      "https://www.facebook.com/profile.php?id=61580918996328",
      "_blank"
    );
  };

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                🚀
              </span>
              <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                Goes Live
                <br />
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Aidonia is OUT NOW!</a>
            </h1>

            <p>
              Discover a smarter way to buy and sell pre-loved student items.
              Join our growing community — where great deals meet
              sustainability. Start exploring today and find everything you need
              for campus life!
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Get Started
            </button>
          </div>

          <div>
            <Image
              src="/images/hero/aidonia logo copy.jpg"
              alt="headphone"
              width={351}
              height={358}
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        {" "}
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                Aidonia
              </span>
            </div>

            <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
              <a href="#">Now on Facebook</a>
            </h1>

            <p>
              Join our growing student community — where great deals meet
              sustainability. Follow us to get the latest updates, exclusive
              offers, and student trends.
            </p>

            <button
              onClick={handleVisitFacebook}
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
            >
              Visit Page
            </button>
          </div>

          <div>
            <Image
              src="/images/hero/fb.png"
              alt="headphone"
              width={351}
              height={358}
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
