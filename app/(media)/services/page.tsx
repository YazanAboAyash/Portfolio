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
import { servicePackages, processSteps } from "@/data/hubs/servicesData";
import type { ProcessStep } from "@/types/hubs/services";
import { m } from "framer-motion";
import {
  MessageSquare,
  Target,
  Code,
  ClipboardCheck,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Target,
  Code,
  ClipboardCheck,
  HeartHandshake,
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
            <li>{t("packages.notes.included")}</li>
            <li>{t("packages.notes.notIncluded")}</li>
            <li>{t("packages.notes.runningCosts")}</li>
            <li>{t("packages.notes.rights")}</li>
            <li>{t("packages.notes.warranty")}</li>
            <li>{t("packages.notes.payment")}</li>
            <li>{t("packages.notes.rates")}</li>
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}

/**
 * Service area section: names the Rhein-Neckar cities served on-site, for
 * local search relevance (Schwetzingen, Mannheim, Heidelberg, and neighbors).
 */
function ServiceArea({ t }: { t: ReturnType<typeof useTranslations> }) {
  const cities = t.raw("serviceArea.cities") as string[];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center">
          <MapPin className="h-6 w-6 text-sky-500" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">
          {t("serviceArea.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("serviceArea.subtitle")}
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {t("serviceArea.citiesLabel")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {cities.map((city) => (
            <Badge key={city} variant="secondary">
              {city}
            </Badge>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
        {t("serviceArea.note")}
      </p>
    </div>
  );
}

/**
 * Stack & delivery section: the providers a client can choose from, and the
 * two delivery modes (Code Only vs Managed Setup).
 */
function StackAndDelivery({ t }: { t: ReturnType<typeof useTranslations> }) {
  const categories = [
    "frontend",
    "database",
    "auth",
    "ai",
    "hosting",
    "email",
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">
          {t("stack.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("stack.subtitle")}
        </p>
      </div>
      <Card className="bg-background/80 backdrop-blur-sm border-border/50">
        <CardContent className="py-6 grid sm:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-1">
                {t(`stack.categories.${category}.label`)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t(`stack.categories.${category}.options`)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="py-6 space-y-2">
            <h4 className="font-semibold">{t("stack.codeOnly.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("stack.codeOnly.description")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardContent className="py-6 space-y-2">
            <h4 className="font-semibold">
              {t("stack.managedSetup.title")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("stack.managedSetup.description")}
            </p>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
        {t("stack.emailNote")}
      </p>
    </div>
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
          <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="sr-only">{t("packages.title")}</h2>
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
            >
              {servicePackages.map((pkg) => (
                <RevealItem key={pkg.id} className="w-full h-full">
                  <PackageCard pkg={pkg} />
                </RevealItem>
              ))}
            </m.div>
          </div>
        </section>

        {/* Service Area Section */}
        <section className="py-16 px-4 lg:px-8">
          <ServiceArea t={t} />
        </section>

        {/* Stack & Delivery Section */}
        <section className="py-16 px-4 lg:px-8">
          <StackAndDelivery t={t} />
        </section>

        {/* Good to Know Section */}
        <section className="py-16 px-4 lg:px-8">
          <PackageNotes t={t} />
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

        {/* Legal notice */}
        <p className="pb-12 px-4 text-center text-xs text-muted-foreground">
          {t("legalNotice")}
        </p>
      </div>
    </div>
  );
}
