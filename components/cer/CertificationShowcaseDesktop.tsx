/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { useTranslations } from "next-intl";
import type { CertificationShowcaseLogic } from "@/components/cer/CertificationShowcase.logic";
import {
  cardRail,
  cardSurface,
  RevealGroup,
  RevealItem,
  ScrambleText,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

interface Certification {
  readonly id: number;
  readonly title: string;
  readonly issuer: string;
  readonly issuerKey?: string;
  readonly date: string;
  readonly description: string;
  readonly descriptionKey: string;
  readonly image: string;
}

interface CertificationShowcaseDesktopProps {
  readonly certifications: readonly Certification[];
  readonly logic: CertificationShowcaseLogic;
  readonly className?: string | undefined;
}

export function CertificationShowcaseDesktop({
  certifications,
  className,
}: CertificationShowcaseDesktopProps) {
  const t = useTranslations("Certifications");
  const tDescriptions = useTranslations("Certifications.descriptions");
  const tIssuers = useTranslations("Certifications.issuers");

  return (
    <section className={className} id="cert">
      <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-12 text-black dark:text-white">
        <ScrambleText text={t("title")} />
      </h2>
      <RevealGroup className="max-w-6xl mx-auto grid grid-cols-2 gap-x-16 gap-y-12">
        {certifications.map((cert, index) => (
          <RevealItem key={cert.id} className="h-full">
            <div className={cn(cardSurface, "h-full overflow-hidden")}>
              <div className={cn(cardRail, "pl-5 p-6")}>
                <span className="text-5xl font-bold text-foreground/8 select-none leading-none block mb-3">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold mb-1 text-foreground">
                  {cert.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {cert.issuerKey ? tIssuers(cert.issuerKey) : cert.issuer}
                </p>
                <p className="text-xs text-muted-foreground/60 mb-3 font-mono">
                  {cert.date}
                </p>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  {tDescriptions(cert.descriptionKey)}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
