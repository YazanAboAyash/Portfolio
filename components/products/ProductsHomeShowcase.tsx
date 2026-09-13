/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { products } from "@/data/hubs/productsData";
import { CTAButton } from "@/components/ui/cta-button";
import {
  cardRail,
  cardSurface,
  RevealGroup,
  RevealItem,
  ScrambleText,
} from "@/components/visuals";
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
      <div ref={ref} className="h-full w-full">
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
              sizes="(min-width: 640px) 50vw, 100vw"
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
      sizes="(min-width: 640px) 50vw, 100vw"
    />
  );
}

export function ProductsHomeShowcase({ className }: ProductsHomeShowcaseProps) {
  const t = useTranslations("Products");
  const tDescriptions = useTranslations("Products.descriptions");

  return (
    <section className={className} id="products">
      <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-12 text-black dark:text-white">
        <ScrambleText text={t("title")} />
      </h2>

      <RevealGroup className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product) => (
          <RevealItem key={product.id} className="h-full">
            <div className={cn(cardSurface, "h-full overflow-hidden flex flex-col")}>
              {/* Top accent line */}
              <div className="h-1 shrink-0 bg-linear-to-r from-border via-muted-foreground/20 to-border" />

              {/* Media: screenshot, or a lazily-loaded silent looping video */}
              <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
                <ProductMediaBlock media={product.media} />
              </div>

              <div className={cn(cardRail, "pl-4 p-5 flex flex-col flex-1")}>
                {/* Title */}
                <h3 className="text-base font-semibold mb-2 text-foreground group-hover/card:text-primary transition-colors duration-200">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {tDescriptions(product.description)}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Demo request */}
                <CTAButton
                  label={t("requestDemo")}
                  className="w-full mt-auto cursor-pointer"
                />
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
