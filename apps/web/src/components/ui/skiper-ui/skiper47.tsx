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
  year?: string;
};

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
  /** Wider viewports need *higher* slidesPerView so each slide stays narrower; lowering it widens cards and makes coverflow read as heavier overlap. */
  const carouselBreakpoints = {
    480: {
      slidesPerView: 1.4,
      spaceBetween: Math.max(14, Math.round(spaceBetween * 0.55)),
    },
    640: {
      slidesPerView: 1.85,
      spaceBetween: Math.max(18, Math.round(spaceBetween * 0.72)),
    },
    768: {
      slidesPerView: 2.2,
      spaceBetween: spaceBetween,
    },
    1024: {
      slidesPerView: 2.55,
      spaceBetween: Math.round(spaceBetween * 1.15),
    },
    1280: {
      slidesPerView: 2.9,
      spaceBetween: Math.round(spaceBetween * 1.35),
    },
    1536: {
      slidesPerView: 3.15,
      spaceBetween: Math.round(spaceBetween * 1.5),
    },
  };
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
        spaceBetween={Math.max(12, Math.round(spaceBetween * 0.5))}
        breakpoints={carouselBreakpoints}
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
        slidesPerView={1.1}
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
              {image.title || image.year ? (
                <div className="m-2 shrink-0 px-1 text-center">
                  {image.title ? (
                    <p className="line-clamp-2 font-display text-sm leading-snug text-on-surface md:text-base">
                      {image.title}
                    </p>
                  ) : null}
                  {image.year ? (
                    <p className="mt-0.5 font-display text-xs text-on-surface-variant md:text-sm">
                      {image.year}
                    </p>
                  ) : null}
                </div>
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
