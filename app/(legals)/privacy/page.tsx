/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Cookie,
  Eye,
  Server,
  Globe,
  Bot,
  Users,
  Timer,
  Scale,
  SlidersHorizontal,
  Wrench,
  Check,
  CalendarClock,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PrivacyControls } from "@/components/cookies";
import Link from "next/link";

/**
 * The review date is fixed rather than `new Date()`. A notice that always claims
 * to have been updated today tells the reader nothing about when its contents
 * were actually checked. Bump this by hand whenever the policy text changes.
 */
const LAST_REVIEWED = "2026-08-02";

/**
 * Section order for the whole notice. The table of contents, the numbering and
 * the heading icons all read from this one list, so a section cannot appear in
 * the contents without appearing in the document.
 */
const SECTIONS = [
  { id: "controller", icon: Scale, titleKey: "controller.title" },
  { id: "overview", icon: Eye, titleKey: "overview.title" },
  { id: "hosting", icon: Server, titleKey: "hosting.title" },
  { id: "cookies", icon: Cookie, titleKey: "cookies.title" },
  { id: "analytics", icon: Globe, titleKey: "analytics.title" },
  { id: "controls", icon: SlidersHorizontal, titleKey: "controls.title" },
  { id: "chatbot", icon: Bot, titleKey: "chatbot.title" },
  { id: "ai-tools", icon: Wrench, titleKey: "aiTools.title" },
  { id: "booking", icon: CalendarClock, titleKey: "booking.title" },
  { id: "recipients", icon: Users, titleKey: "recipients.title" },
  { id: "retention", icon: Timer, titleKey: "retention.title" },
  { id: "rights", icon: Shield, titleKey: "rights.title" },
  { id: "changes", icon: Eye, titleKey: "changes.title" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/**
 * The site's palette is deliberately monochrome — every theme token is a
 * zero-chroma neutral. Emphasis here therefore comes from rules, weight and
 * fills drawn from those same tokens, never from an imported accent hue, so the
 * notice sits in the same visual system as the rest of the site and stays
 * legible in both themes without per-colour dark-mode overrides.
 */
function Section({
  id,
  title,
  children,
}: {
  id: SectionId;
  title: string;
  children: React.ReactNode;
}) {
  const index = SECTIONS.findIndex((s) => s.id === id);
  const Icon = SECTIONS[index]!.icon;

  return (
    <section
      id={id}
      className="scroll-mt-28 border-t px-6 py-9 first:border-t-0 sm:px-10"
    >
      <h2 className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-foreground/70">
          <Icon className="size-4" aria-hidden={true} />
        </span>
        <span className="flex-1 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </span>
        <span
          className="text-xs font-medium tabular-nums text-muted-foreground/50"
          aria-hidden={true}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
  );
}

/**
 * Splits "Legal basis: Art. 6(1)(f) GDPR — …" at the first colon so the label can
 * be set apart. The slice keeps the colon and anything before it, which also
 * preserves the French space-before-colon convention.
 */
function LegalBasis({ children }: { children: string }) {
  const colon = children.indexOf(":");
  const label = colon === -1 ? null : children.slice(0, colon).trim();
  const rest = colon === -1 ? children : children.slice(colon + 1).trim();

  return (
    <div className="border-l-2 border-foreground/25 bg-muted/40 py-3 pl-4 pr-4">
      {label && (
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-foreground/70">
          {label}
        </p>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">{rest}</p>
    </div>
  );
}

/** Pulled-out passage: same neutral system, stronger fill and a full border. */
function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 rounded-lg border bg-muted/60 p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/** Plain sub-item in a list of cookies, recipients or tools. */
function Item({
  title,
  children,
  meta,
  as: Heading = "p",
}: {
  title: string;
  children: React.ReactNode;
  meta?: string;
  as?: "p" | "h3";
}) {
  return (
    <div className="space-y-1 rounded-lg border p-4">
      <Heading className="text-sm font-medium text-foreground">{title}</Heading>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
      {meta && <p className="text-xs text-muted-foreground/80">{meta}</p>}
    </div>
  );
}

const linkClass =
  "font-medium text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors";

export default async function Privacy() {
  const t = await getTranslations("Privacy");

  return (
    <div className="container mx-auto mt-20 max-w-6xl px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full border bg-muted/60">
            <Shield className="size-6 text-foreground/70" aria-hidden={true} />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Separator className="my-6" />

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* Contents — the ids below are the anchor targets */}
        <nav
          aria-label={t("title")}
          className="sticky top-24 hidden self-start rounded-xl border bg-card/60 p-4 backdrop-blur-md lg:block"
        >
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t("title")}
          </p>
          <ol className="space-y-0.5 border-l">
            {SECTIONS.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px flex items-start gap-2 border-l border-transparent py-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  <span className="pt-px text-[0.7rem] tabular-nums text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{t(section.titleKey)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Card className="gap-0 overflow-hidden py-0">
          {/* Art. 13(1)(a) DSGVO — identity and contact details of the controller */}
          <Section id="controller" title={t("controller.title")}>
            <Prose>{t("controller.intro")}</Prose>
            <address className="not-italic space-y-1 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">
                {t("controller.name")}
              </p>
              <p className="text-muted-foreground">{t("controller.address")}</p>
              <p className="text-muted-foreground">{t("controller.city")}</p>
              <p className="text-muted-foreground">{t("controller.country")}</p>
              <p className="pt-1 text-muted-foreground">
                {t("controller.emailLabel")}{" "}
                <a
                  href={`mailto:${t("controller.email")}`}
                  className={linkClass}
                >
                  {t("controller.email")}
                </a>
              </p>
            </address>
            <Prose>
              {t("controller.impressumNote")}{" "}
              <Link href="/impressum" className={linkClass}>
                {t("controller.impressumLink")}
              </Link>
            </Prose>
          </Section>

          <Section id="overview" title={t("overview.title")}>
            <Prose>{t("overview.description")}</Prose>
            <Callout title={t("overview.keyPoint")}>
              {t("overview.keyPointDescription")}
            </Callout>
          </Section>

          {/* Server logs / hosting */}
          <Section id="hosting" title={t("hosting.title")}>
            <Prose>{t("hosting.description")}</Prose>
            <LegalBasis>{t("hosting.legalBasis")}</LegalBasis>
          </Section>

          {/* Cookies and local storage */}
          <Section id="cookies" title={t("cookies.title")}>
            <Prose>{t("cookies.description")}</Prose>
            <div className="space-y-3">
              {(["locale", "theme", "consent", "chat"] as const).map((key) => (
                <Item
                  key={key}
                  as="h3"
                  title={t(`cookies.${key}.title`)}
                  meta={t(`cookies.${key}.retention`)}
                >
                  {t(`cookies.${key}.description`)}
                </Item>
              ))}
            </div>
            <LegalBasis>{t("cookies.legalBasis")}</LegalBasis>
          </Section>

          {/* Analytics — consent-gated */}
          <Section id="analytics" title={t("analytics.title")}>
            <Prose>{t("analytics.description")}</Prose>
            <Prose>{t("analytics.dataCollected")}</Prose>
            <LegalBasis>{t("analytics.legalBasis")}</LegalBasis>
          </Section>

          {/* Consent controls — Art. 7(3) DSGVO */}
          <Section id="controls" title={t("controls.title")}>
            <Prose>{t("controls.description")}</Prose>
            <PrivacyControls />
          </Section>

          {/* AI chatbot */}
          <Section id="chatbot" title={t("chatbot.title")}>
            <Prose>{t("chatbot.description")}</Prose>
            <Item title={t("chatbot.alwaysTitle")}>
              {t("chatbot.alwaysDescription")}
            </Item>
            <Item title={t("chatbot.storedTitle")}>
              {t("chatbot.storedDescription")}
            </Item>
            <Callout title={t("chatbot.aiNoticeTitle")}>
              {t("chatbot.aiNoticeDescription")}
            </Callout>
            <LegalBasis>{t("chatbot.legalBasis")}</LegalBasis>
          </Section>

          {/* Other AI-backed tools */}
          <Section id="ai-tools" title={t("aiTools.title")}>
            <Prose>{t("aiTools.description")}</Prose>
            <Item title={t("aiTools.emailTitle")}>
              {t("aiTools.emailDescription")}
            </Item>
            <Item title={t("aiTools.auditTitle")}>
              {t("aiTools.auditDescription")}
            </Item>
            <LegalBasis>{t("aiTools.legalBasis")}</LegalBasis>
          </Section>

          {/* Booking */}
          <Section id="booking" title={t("booking.title")}>
            <Prose>{t("booking.description")}</Prose>
            <Item title={t("booking.calendlyTitle")}>
              {t("booking.calendlyDescription")}
            </Item>
            <LegalBasis>{t("booking.legalBasis")}</LegalBasis>
          </Section>

          {/* Art. 13(1)(e)-(f) — recipients and third-country transfers */}
          <Section id="recipients" title={t("recipients.title")}>
            <Prose>{t("recipients.description")}</Prose>
            <div className="space-y-3">
              {(["vercel", "openai", "groq", "calendly"] as const).map((key) => (
                <Item
                  key={key}
                  as="h3"
                  title={t(`recipients.${key}.name`)}
                  meta={t(`recipients.${key}.location`)}
                >
                  {t(`recipients.${key}.purpose`)}
                </Item>
              ))}
            </div>
            <Callout title={t("recipients.transfersTitle")}>
              {t("recipients.transfersDescription")}
            </Callout>
          </Section>

          {/* Art. 13(2)(a) — retention */}
          <Section id="retention" title={t("retention.title")}>
            <Prose>{t("retention.description")}</Prose>
            <ul className="grid gap-2.5">
              {(
                ["serverLogs", "chatSessions", "chatRecords", "browser"] as const
              ).map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-foreground/40"
                    aria-hidden={true}
                  />
                  <span className="text-sm leading-relaxed">
                    {t(`retention.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Art. 13(2)(b)-(d) — data subject rights */}
          <Section id="rights" title={t("rights.title")}>
            <Prose>{t("rights.description")}</Prose>
            <ul className="grid gap-2.5">
              {(
                [
                  "access",
                  "rectification",
                  "erasure",
                  "restriction",
                  "portability",
                  "objection",
                  "withdraw",
                ] as const
              ).map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-foreground/60"
                    aria-hidden={true}
                  />
                  <span className="text-sm leading-relaxed">
                    {t(`rights.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
            <Prose>{t("rights.howTo")}</Prose>
            <Callout title={t("rights.complaintTitle")}>
              <p>{t("rights.complaintDescription")}</p>
              <address className="not-italic mt-2 space-y-0.5 text-foreground/80">
                <p>{t("rights.authorityName")}</p>
                <p>{t("rights.authorityAddress")}</p>
                <p>{t("rights.authorityCity")}</p>
              </address>
            </Callout>
          </Section>

          <Section id="changes" title={t("changes.title")}>
            <Prose>{t("changes.description")}</Prose>
          </Section>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          {t("lastUpdated")} {LAST_REVIEWED}
        </p>
      </div>
    </div>
  );
}
