"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import "swiper/css/effect-cards";

import { cn } from "@/lib/utils";

export type Carousel001Image = {
  src: string;
  alt: string;
  title?: string;
};

const Skiper47 = () => {
  const images: Carousel001Image[] = [
    {
      src: "/images/x.com/11.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "/images/x.com/13.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "/images/x.com/32.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "/images/x.com/20.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "/images/x.com/21.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
    {
      src: "/images/x.com/19.jpeg",
      alt: "Illustrations by my fav AarzooAly",
    },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <Carousel_001 className="" images={images} showPagination loop />
    </div>
  );
};

export { Skiper47 };

const navButtonClass =
  "flex size-10 items-center justify-center rounded-none bg-surface-container-low text-on-surface shadow-[0_12px_24px_color-mix(in_srgb,var(--on-surface)_4%,transparent)] transition-colors after:hidden hover:bg-primary hover:text-primary-foreground";

const Carousel_001 = ({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  autoplayDelay,
  spaceBetween = 40,
  onSlideClick,
}: {
  images: Carousel001Image[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  spaceBetween?: number;
  onSlideClick?: (index: number) => void;
}) => {
  const delayMs = autoplayDelay ?? 1500;
  const css = `
  .Carousal_001 {
    padding-bottom: 50px !important;
  }
  .Carousal_001 .swiper-pagination-bullet {
    background: color-mix(in srgb, var(--on-surface) 35%, transparent);
    opacity: 1;
  }
  .Carousal_001 .swiper-pagination-bullet-active {
    background: var(--primary);
  }
  `;
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full max-w-4xl", className)}
    >
      <style>{css}</style>

      <Swiper
        spaceBetween={spaceBetween}
        autoplay={
          autoplay
            ? {
                delay: delayMs,
                disableOnInteraction: false,
              }
            : false
        }
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={loop}
        slidesPerView={2.43}
        slideToClickedSlide={true}
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={
          showPagination
            ? {
                clickable: true,
              }
            : false
        }
        navigation={
          showNavigation
            ? {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }
            : false
        }
        className="Carousal_001"
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={`${image.src}-${index}`}
            virtualIndex={index}
            className="!h-auto w-full border border-outline-variant/30"
          >
            <div
              role={onSlideClick ? "button" : undefined}
              tabIndex={onSlideClick ? 0 : undefined}
              onClick={() => onSlideClick?.(index)}
              onKeyDown={(e) => {
                if (!onSlideClick) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSlideClick(index);
                }
              }}
              className={cn(
                "flex h-full min-h-[280px] flex-col outline-none",
                onSlideClick &&
                  "cursor-pointer focus-visible:ring-1 focus-visible:ring-primary",
              )}
            >
              {image.title ? (
                <p className="mb-2 line-clamp-2 shrink-0 px-1 text-center font-display text-sm leading-snug text-on-surface md:text-base">
                  {image.title}
                </p>
              ) : null}
              <div className="relative min-h-[220px] flex-1 overflow-hidden bg-surface-dim md:min-h-[260px]">
                <img
                  className="h-full min-h-[220px] w-full object-cover md:min-h-[260px]"
                  src={image.src}
                  alt={image.alt}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
        {showNavigation && (
          <div>
            <div
              className={cn("swiper-button-next", navButtonClass)}
              role="button"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="size-5" strokeWidth={1.5} />
            </div>
            <div
              className={cn("swiper-button-prev", navButtonClass)}
              role="button"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="size-5" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </Swiper>
    </motion.div>
  );
};

export { Carousel_001 };

/**
 * Skiper 47 Carousel_001 — React + Swiper
 * Built with Swiper.js - Read docs to learn more https://swiperjs.com/
 * Illustrations by AarzooAly - https://x.com/AarzooAly
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
