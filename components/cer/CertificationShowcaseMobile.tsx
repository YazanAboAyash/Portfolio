/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { useTranslations } from "next-intl";
import type { CertificationShowcaseLogic } from "@/components/cer/CertificationShowcase.logic";
import {
  cardSurface,
  RevealGroup,
  RevealItem,
  SectionHeading,
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

interface CertificationShowcaseMobileProps {
  readonly certifications: readonly Certification[];
  readonly logic: CertificationShowcaseLogic;
  readonly className?: string | undefined;
}

export function CertificationShowcaseMobile({
  certifications,
  className,
}: CertificationShowcaseMobileProps) {
  const t = useTranslations("Certifications");
  const tDescriptions = useTranslations("Certifications.descriptions");
  const tIssuers = useTranslations("Certifications.issuers");

  return (
    <section className={className} id="cert" aria-labelledby="cert-title">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <SectionHeading
            id="cert-title"
            title={t("title")}
            className="lg:sticky lg:top-24"
          />
        </div>
        <RevealGroup className="col-span-12 flex flex-col gap-2 lg:col-span-8">
          {certifications.map((cert) => (
            <RevealItem key={cert.id}>
              <article
                className={cn(
                  cardSurface,
                  "grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 p-5",
                )}
              >
                <p className="text-lg font-semibold tabular-nums leading-snug">
                  {cert.date}
                </p>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold leading-snug tracking-[-0.01em]">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cert.issuerKey ? tIssuers(cert.issuerKey) : cert.issuer}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-foreground">
                    {tDescriptions(cert.descriptionKey)}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
