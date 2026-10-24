/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { useTranslations } from "next-intl";
import type { CertificationShowcaseLogic } from "@/components/cer/CertificationShowcase.logic";
import { RevealGroup, RevealItem, SectionHeading } from "@/components/visuals";

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
  const tIssuers = useTranslations("Certifications.issuersShort");

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
        {/* A plain list on phones and tablets; descriptions stay on desktop */}
        <RevealGroup className="col-span-12 flex flex-col lg:col-span-8">
          {certifications.map((cert) => (
            <RevealItem key={cert.id}>
              <article className="grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-b border-surface-2 py-4">
                <p className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {cert.date}
                </p>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cert.issuerKey ? tIssuers(cert.issuerKey) : cert.issuer}
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
