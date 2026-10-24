/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { products } from "@/data/hubs/productsData";
import { CTAButton } from "@/components/ui/cta-button";
import { RevealGroup, RevealItem, ScrambleText } from "@/components/visuals";
import { cn } from "@/lib/utils";
import type {
  ProductMedia as ProductMediaType,
  ProductsHomeShowcaseProps,
} from "@/types/hubs/products";

/**
 * Renders a product's screenshot, or its video only once scrolled into view —
 * the source clips run several MB and autoplay on mount, so eagerly rendering
 * every `<video>` on page load would pull all of them down at once.
 */
function ProductMediaBlock({ media }: { media: ProductMediaType }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (media.type === "video") {
    return (
      <div ref={ref} className="relative h-full w-full">
        {isInView ? (
          <video
            className="h-full w-full object-cover"
            src={media.src}
            poster={media.poster}
            aria-label={media.alt}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          media.poster && (
            <Image
              src={media.poster}
              alt={media.alt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          )
        )}
      </div>
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      className="object-cover"
      sizes="(min-width: 1024px) 58vw, 100vw"
    />
  );
}

export function ProductsHomeShowcase({ className }: ProductsHomeShowcaseProps) {
  const t = useTranslations("Products");
  const tDescriptions = useTranslations("Products.descriptions");
  const tSummaries = useTranslations("Products.summaries");
  const [activeId, setActiveId] = useState(products[0]?.id);
  const tabIds = useId();
  const product = products.find((item) => item.id === activeId) ?? products[0];

  if (!product) return null;

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = products.findIndex((item) => item.id === product.id);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = products[(index + step + products.length) % products.length];
    if (!next) return;
    setActiveId(next.id);
    document.getElementById(`${tabIds}-tab-${next.id}`)?.focus();
  };

  return (
    <section
      className={cn("bg-surface", className)}
      id="products"
      aria-labelledby="products-title"
    >
      <RevealGroup className="frame grid grid-cols-12 items-center gap-x-6 gap-y-10">
        {/* Media: screenshot, or a lazily-loaded silent looping video */}
        <RevealItem className="col-span-12 lg:col-span-7">
          <figure className="relative aspect-video w-full overflow-hidden bg-black">
            <ProductMediaBlock key={product.id} media={product.media} />
            <figcaption className="absolute bottom-4 left-4 bg-background px-2.5 py-1.5 text-sm font-medium text-foreground">
              {product.title}
            </figcaption>
          </figure>
        </RevealItem>

        <RevealItem className="order-first col-span-12 flex flex-col gap-8 lg:order-0 lg:col-span-5 lg:pl-6">
          <div className="flex flex-col gap-4">
            <h2
              id="products-title"
              className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            >
              <ScrambleText text={t("title")} />
            </h2>
            <div
              role="tablist"
              aria-label={t("title")}
              className="flex flex-wrap gap-6"
            >
              {products.map((item) => {
                const selected = item.id === product.id;
                return (
                  <button
                    key={item.id}
                    id={`${tabIds}-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`${tabIds}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(item.id)}
                    onKeyDown={onTabKeyDown}
                    className={`relative cursor-pointer py-1 text-xl font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.75 after:origin-left after:bg-foreground after:transition-transform after:duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground ${
                      selected
                        ? "text-foreground after:scale-x-100"
                        : "text-muted-foreground after:scale-x-0 hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`${tabIds}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabIds}-tab-${product.id}`}
            className="flex flex-col gap-5"
          >
            <h3 className="text-3xl font-bold leading-tight tracking-[-0.02em]">
              {product.title}
            </h3>
            {/* One line on phones, the full description from md */}
            <p className="max-w-[44ch] text-base leading-relaxed text-foreground md:text-lg">
              <span className="md:hidden">{tSummaries(product.description)}</span>
              <span className="hidden md:inline">
                {tDescriptions(product.description)}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {product.technologies.join(" · ")}
            </p>

            {/* Demo request */}
            <CTAButton
              label={t("requestDemo")}
              className="h-12 w-full cursor-pointer rounded-none px-6 font-semibold shadow-none transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto sm:self-start"
            />
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
