/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CTAButton } from "@/components/ui/cta-button";
import { PackageCard } from "@/components/services";
import { RevealItem } from "@/components/visuals";
import {
  packagesByTier,
  processSteps,
  trustSignals,
} from "@/data/hubs/servicesData";
import type { ProcessStep, TrustSignal } from "@/types/hubs/services";
import { m } from "framer-motion";
import {
  MessageSquare,
  Target,
  Code,
  ClipboardCheck,
  HeartHandshake,
  Database,
  TrendingUp,
  Shield,
  Plug,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Target,
  Code,
  ClipboardCheck,
  HeartHandshake,
  Database,
  TrendingUp,
  Shield,
  Plug,
};

// Animation variants — no opacity in hidden so LCP element is never invisible
const fadeInUp = {
  hidden: { y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Process Step Component
 */
function ProcessStepCard({
  step,
  t,
  isLast,
}: {
  step: ProcessStep;
  t: ReturnType<typeof useTranslations>;
  isLast: boolean;
}) {
  const IconComponent = iconMap[step.icon];

  return (
    <m.div variants={fadeInUp} className="relative w-full max-w-xl">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 font-bold text-lg">
            {step.step}
          </div>
          {!isLast && (
            <div className="w-px h-full min-h-15 bg-linear-to-b from-sky-500/30 to-transparent mt-2" />
          )}
        </div>
        <div className="flex-1 pb-8 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {IconComponent && (
              <IconComponent className="h-5 w-5 text-black dark:text-muted-foreground shrink-0" />
            )}
            <h3 className="text-lg font-semibold">{t(step.titleKey)}</h3>
          </div>
          <p className="text-black dark:text-muted-foreground">
            {t(step.descriptionKey)}
          </p>
        </div>
      </div>
    </m.div>
  );
}

/**
 * Trust Signal Card Component
 */

function TrustCard({
  signal,
  t,
}: {
  signal: TrustSignal;
  t: ReturnType<typeof useTranslations>;
}) {
  const IconComponent = iconMap[signal.icon];

  return (
    <m.div variants={fadeInUp}>
      <Card className="h-full hover:border-muted-foreground/30 transition-colors bg-background/80 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {IconComponent && (
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                <IconComponent className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-1">{t(signal.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(signal.descriptionKey)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}

/**
 * Fine print under the package grid: price note (PAngV), running costs,
 * usage rights, warranty scope and payment terms.
 * The price note renders only once `packages.notes.vat` is filled in.
 */
function PackageNotes({ t }: { t: ReturnType<typeof useTranslations> }) {
  const vatNote = t("packages.notes.vat");

  return (
    <aside className="max-w-3xl mx-auto">
      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardContent className="py-6 space-y-3">
          <h3 className="font-semibold">{t("packages.notes.title")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            {vatNote !== "" && <li>{vatNote}</li>}
            <li>{t("packages.notes.runningCosts")}</li>
            <li>{t("packages.notes.rights")}</li>
            <li>{t("packages.notes.warranty")}</li>
            <li>{t("packages.notes.payment")}</li>
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}

/**
 * Services Page Main Component
 */
export default function ServicesPage() {
  const t = useTranslations("Services");

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <m.div
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
              className="space-y-6"
            >
              <m.div variants={fadeInUp}>
                <Badge variant="outline" className="mb-4">
                  Services
                </Badge>
              </m.div>
              <m.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold"
              >
                {t("hero.title")}
              </m.h1>
              <m.div variants={fadeInUp}>
                <p className="text-l text-black dark:text-muted-foreground max-w-3xl mx-auto bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                  {t("hero.subtitle")}
                </p>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* Packages Section - ON TOP as per user requirement */}
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-8xl mx-auto space-y-16">
            <h2 className="sr-only">{t("packages.title")}</h2>
            {packagesByTier.map(({ tier, packages }) => (
              <div key={tier}>
                <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  {t(`packages.tiers.${tier}`)}
                </h3>
                <m.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerChildren}
                  className="flex flex-wrap justify-center gap-6"
                >
                  {packages.map((pkg) => (
                    <RevealItem key={pkg.id} className="w-full max-w-sm">
                      <PackageCard pkg={pkg} />
                    </RevealItem>
                  ))}
                </m.div>
              </div>
            ))}
            <PackageNotes t={t} />
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
            >
              <m.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("process.title")}
                </h2>
                <p className="text-l text-black dark:text-muted-foreground max-w-2xl mx-auto bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                  {t("process.subtitle")}
                </p>
              </m.div>
              <Card className="p-6 md:p-8 bg-background/80 backdrop-blur-sm border-border/50 shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  {processSteps.map((step, index) => (
                    <ProcessStepCard
                      key={step.step}
                      step={step}
                      t={t}
                      isLast={index === processSteps.length - 1}
                    />
                  ))}
                </div>
              </Card>
            </m.div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-16 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
            >
              <m.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t("trust.title")}
                </h2>
                <p className="text-l text-black dark:text-muted-foreground max-w-2xl mx-auto bg-background/70 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                  {t("trust.subtitle")}
                </p>
              </m.div>
              <div className="grid md:grid-cols-2 gap-4">
                {trustSignals.map((signal) => (
                  <TrustCard key={signal.id} signal={signal} t={t} />
                ))}
              </div>
            </m.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
            >
              <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-lg">
                <CardContent className="py-12 text-center space-y-6">
                  <m.h2
                    variants={fadeInUp}
                    className="text-3xl md:text-4xl font-bold"
                  >
                    {t("cta.title")}
                  </m.h2>
                  <m.p
                    variants={fadeInUp}
                    className="text-muted-foreground max-w-xl mx-auto"
                  >
                    {t("cta.subtitle")}
                  </m.p>
                  <m.div variants={fadeInUp}>
                    <CTAButton
                      label={t("cta.button")}
                      size="lg"
                      className="bg-sky-600 hover:bg-sky-700 text-white"
                    />
                  </m.div>
                </CardContent>
              </Card>
            </m.div>
          </div>
        </section>
      </div>
    </div>
  );
}
