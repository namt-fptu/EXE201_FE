import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Student-to-student Deals",
    description: "Buy & sell directly on campus",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Easy Exchanges",
    description: "Cancel or edit within 1 day",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "Secure Payments",
    description: "Safe and verified transactions",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "24/7 Student Support",
    description: "We're here anytime you need",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="flex items-center justify-between gap-4 xl:gap-8 mt-10 flex-wrap md:flex-nowrap">
        {featureData.map((item, key) => (
          <div
            className="flex items-center gap-3 flex-1 min-w-[200px]"
            key={key}
          >
            <Image
              src={item.img}
              alt="icons"
              width={40}
              height={41}
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base text-dark leading-tight whitespace-nowrap">
                {item.title}
              </h3>
              <p className="text-sm whitespace-nowrap text-gray-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
