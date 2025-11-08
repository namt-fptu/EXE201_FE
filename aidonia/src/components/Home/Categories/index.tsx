"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import api from "@/services/axios";
import Link from "next/link";

const Categories = () => {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("categories");
        console.log("Categories response:", response.data);

        if (response.data) {
          const categoryData = response.data.data || response.data;

          if (Array.isArray(categoryData)) {
            setCategories(categoryData);
            console.log("Categories loaded successfully:", categoryData);
          } else {
            console.error("Categories data is not an array:", categoryData);
            setCategories([]);
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.swiper.init();
    }
  }, []);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-17.5 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* Section title */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-blue mb-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_834_7356)">
                    <path
                      d="M3.94024 13.4474C2.6523 12.1595 2.00832 11.5155 1.7687 10.68C1.52908 9.84449 1.73387 8.9571 2.14343 7.18231L2.37962 6.15883C2.72419 4.66569 2.89648 3.91912 3.40771 3.40789C3.91894 2.89666 4.66551 2.72437 6.15865 2.3798L7.18213 2.14361C8.95692 1.73405 9.84431 1.52927 10.6798 1.76889C11.5153 2.00851 12.1593 2.65248 13.4472 3.94042L14.9719 5.46512C17.2128 7.70594 18.3332 8.82635 18.3332 10.2186C18.3332 11.6109 17.2128 12.7313 14.9719 14.9721C12.7311 17.2129 11.6107 18.3334 10.2184 18.3334C8.82617 18.3334 7.70576 17.2129 5.46494 14.9721L3.94024 13.4474Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="7.17245"
                      cy="7.39917"
                      r="1.66667"
                      transform="rotate(-45 7.17245 7.39917)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9.61837 15.4164L15.4342 9.6004"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_834_7356">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Categories
              </span>
              <h2 className="font-bold text-2xl xl:text-heading-4 text-dark">
                Browse by Category
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev} 
                className="swiper-button-prev w-11 h-11 rounded-lg border border-gray-3 flex items-center justify-center text-gray-5 hover:bg-blue hover:text-white hover:border-blue transition-all duration-300"
                aria-label="Previous"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>

              <button 
                onClick={handleNext} 
                className="swiper-button-next w-11 h-11 rounded-lg border border-gray-3 flex items-center justify-center text-gray-5 hover:bg-blue hover:text-white hover:border-blue transition-all duration-300"
                aria-label="Next"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={6}
            spaceBetween={20}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1000: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              1200: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, key) => (
                <SwiperSlide key={key}>
                  <div className="group flex flex-col items-center">
                    <div className="max-w-[130px] w-full bg-gray-2 h-32.5 rounded-full flex items-center justify-center mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-2 rounded w-20 animate-pulse"></div>
                  </div>
                </SwiperSlide>
              ))
            ) : categories.length > 0 ? (
              categories.map((category, key) => (
                <SwiperSlide key={category.id || key}>
                  <Link
                    href={`/shop-with-sidebar?category=${category.id}`}
                    className="group flex flex-col items-center"
                  >
                    <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {category.icon || "📦"}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <h3 className="inline-block font-medium text-center text-dark group-hover:text-blue transition-colors duration-300">
                        {category.name || category.categoryName}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No categories available
              </div>
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;