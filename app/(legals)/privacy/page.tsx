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
  Gavel,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PrivacyControls } from "@/components/cookies";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * The review date is fixed rather than `new Date()`. A notice that always claims
 * to have been updated today tells the reader nothing about when its contents
 * were actually checked. Bump this by hand whenever the policy text changes.
 */
const LAST_REVIEWED = "2026-07-28";

/**
 * The theme's `--primary` is a zero-chroma neutral, so `text-primary` renders as
 * grey. Emphasis on this page therefore comes from explicit palette hues, used
 * sparingly so that a highlight still means something:
 *
 *   blue    — explanatory callouts (what a section means in practice)
 *   amber   — legal bases and statutory citations
 *   emerald — things you can act on, and your rights
 *   rose    — escalation (the supervisory authority)
 */
const tones = {
  blue: {
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    box: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
    title: "text-blue-900 dark:text-blue-100",
    body: "text-blue-800 dark:text-blue-200/90",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    title: "text-amber-900 dark:text-amber-100",
    body: "text-amber-800 dark:text-amber-200/90",
  },
  emerald: {
    chip:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    box: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    title: "text-emerald-900 dark:text-emerald-100",
    body: "text-emerald-800 dark:text-emerald-200/90",
  },
  rose: {
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    box: "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30",
    title: "text-rose-900 dark:text-rose-100",
    body: "text-rose-800 dark:text-rose-200/90",
  },
} as const;

type Tone = keyof typeof tones;

/**
 * One numbered block of the notice. Sections are separated by rules rather than
 * by their own cards, so the whole notice reads as a single continuous document.
 */
function Section({
  id,
  icon: Icon,
  title,
  tone = "blue",
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t px-5 py-8 first:border-t-0 sm:px-8"
    >
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold tracking-tight">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tones[tone].chip,
          )}
        >
          <Icon className="size-4" aria-hidden={true} />
        </span>
        {title}
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
 * be emphasised. The slice keeps the colon and anything before it, which also
 * preserves the French space-before-colon convention.
 */
function LegalBasis({ children }: { children: string }) {
  const colon = children.indexOf(":");
  const label = colon === -1 ? null : children.slice(0, colon + 1);
  const rest = colon === -1 ? children : children.slice(colon + 1).trimStart();

  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed",
        tones.amber.box,
        tones.amber.body,
      )}
    >
      <Gavel className="mt-px size-3.5 shrink-0" aria-hidden={true} />
      <span>
        {label && (
          <strong className={cn("font-semibold", tones.amber.title)}>
            {label}{" "}
          </strong>
        )}
        {rest}
      </span>
    </p>
  );
}

function Callout({
  tone = "blue",
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5 rounded-lg border p-4", tones[tone].box)}>
      <p className={cn("text-sm font-semibold", tones[tone].title)}>{title}</p>
      <div className={cn("text-sm leading-relaxed", tones[tone].body)}>
        {children}
      </div>
    </div>
  );
}

/** Neutral sub-item, so the coloured callouts keep their emphasis. */
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
    <div className="space-y-1 rounded-lg border bg-muted/30 p-4">
      <Heading className="text-sm font-medium">{title}</Heading>
      <p className="text-sm text-muted-foreground">{children}</p>
      {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
}

export default async function Privacy() {
  const t = await getTranslations("Privacy");

  return (
    <div className="container mx-auto mt-20 max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                tones.blue.chip,
              )}
            >
              <Shield className="size-6" aria-hidden={true} />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Separator />

        <Card className="gap-0 overflow-hidden py-0">
          {/* Art. 13(1)(a) DSGVO — identity and contact details of the controller */}
          <Section id="controller" icon={Scale} title={t("controller.title")}>
            <Prose>{t("controller.intro")}</Prose>
            <address className="not-italic space-y-1 rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">{t("controller.name")}</p>
              <p className="text-muted-foreground">{t("controller.address")}</p>
              <p className="text-muted-foreground">{t("controller.city")}</p>
              <p className="text-muted-foreground">{t("controller.country")}</p>
              <p className="pt-1">
                {t("controller.emailLabel")}{" "}
                <a
                  href={`mailto:${t("controller.email")}`}
                  className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                >
                  {t("controller.email")}
                </a>
              </p>
            </address>
            <Prose>
              {t("controller.impressumNote")}{" "}
              <Link
                href="/impressum"
                className="font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                {t("controller.impressumLink")}
              </Link>
            </Prose>
          </Section>

          <Section id="overview" icon={Eye} title={t("overview.title")}>
            <Prose>{t("overview.description")}</Prose>
            <Callout title={t("overview.keyPoint")}>
              {t("overview.keyPointDescription")}
            </Callout>
          </Section>

          {/* Server logs / hosting */}
          <Section id="hosting" icon={Server} title={t("hosting.title")}>
            <Prose>{t("hosting.description")}</Prose>
            <LegalBasis>{t("hosting.legalBasis")}</LegalBasis>
          </Section>

          {/* Cookies and local storage */}
          <Section id="cookies" icon={Cookie} title={t("cookies.title")}>
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
          <Section id="analytics" icon={Globe} title={t("analytics.title")}>
            <Prose>{t("analytics.description")}</Prose>
            <Prose>{t("analytics.dataCollected")}</Prose>
            <LegalBasis>{t("analytics.legalBasis")}</LegalBasis>
          </Section>

          {/* Consent controls — Art. 7(3) DSGVO */}
          <Section
            id="controls"
            icon={SlidersHorizontal}
            title={t("controls.title")}
            tone="emerald"
          >
            <Prose>{t("controls.description")}</Prose>
            <PrivacyControls />
          </Section>

          {/* AI chatbot */}
          <Section id="chatbot" icon={Bot} title={t("chatbot.title")}>
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
          <Section id="ai-tools" icon={Wrench} title={t("aiTools.title")}>
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
          <Section id="booking" icon={Server} title={t("booking.title")}>
            <Prose>{t("booking.description")}</Prose>
            <Item title={t("booking.calendlyTitle")}>
              {t("booking.calendlyDescription")}
            </Item>
            <LegalBasis>{t("booking.legalBasis")}</LegalBasis>
          </Section>

          {/* Art. 13(1)(e)-(f) — recipients and third-country transfers */}
          <Section id="recipients" icon={Users} title={t("recipients.title")}>
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
            <Callout tone="amber" title={t("recipients.transfersTitle")}>
              {t("recipients.transfersDescription")}
            </Callout>
          </Section>

          {/* Art. 13(2)(a) — retention */}
          <Section id="retention" icon={Timer} title={t("retention.title")}>
            <Prose>{t("retention.description")}</Prose>
            <ul className="grid gap-2.5">
              {(
                ["serverLogs", "chatSessions", "chatRecords", "browser"] as const
              ).map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                    aria-hidden={true}
                  />
                  <span className="text-sm">{t(`retention.${key}`)}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Art. 13(2)(b)-(d) — data subject rights */}
          <Section
            id="rights"
            icon={Shield}
            title={t("rights.title")}
            tone="emerald"
          >
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
                <li key={key} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden={true}
                  />
                  <span className="text-sm">{t(`rights.${key}`)}</span>
                </li>
              ))}
            </ul>
            <Prose>{t("rights.howTo")}</Prose>
            <Callout tone="rose" title={t("rights.complaintTitle")}>
              <p>{t("rights.complaintDescription")}</p>
              <address className="not-italic mt-2 space-y-0.5">
                <p>{t("rights.authorityName")}</p>
                <p>{t("rights.authorityAddress")}</p>
                <p>{t("rights.authorityCity")}</p>
              </address>
            </Callout>
          </Section>

          <Section id="changes" icon={Eye} title={t("changes.title")}>
            <Prose>{t("changes.description")}</Prose>
          </Section>
        </Card>

        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            {t("lastUpdated")} {LAST_REVIEWED}
          </p>
        </div>
      </div>
    </div>
  );
}
