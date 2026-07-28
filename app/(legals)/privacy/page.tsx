/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PrivacyControls } from "@/components/cookies";
import Link from "next/link";

/**
 * The review date is fixed rather than `new Date()`. A notice that always claims
 * to have been updated today tells the reader nothing about when its contents
 * were actually checked. Bump this by hand whenever the policy text changes.
 */
const LAST_REVIEWED = "2026-07-28";

function LegalBasis({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
      {children}
    </p>
  );
}

function Recipient({
  name,
  purpose,
  location,
}: {
  name: string;
  purpose: string;
  location: string;
}) {
  return (
    <div className="p-3 border rounded-lg space-y-1">
      <p className="font-medium text-sm">{name}</p>
      <p className="text-sm text-muted-foreground">{purpose}</p>
      <p className="text-xs text-muted-foreground">{location}</p>
    </div>
  );
}

export default async function Privacy() {
  const t = await getTranslations("Privacy");

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
        </div>

        <Separator />

        {/* Art. 13(1)(a) DSGVO — identity and contact details of the controller */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" aria-hidden="true" />
              {t("controller.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("controller.intro")}
            </p>
            <address className="not-italic text-sm space-y-1">
              <p className="font-medium">{t("controller.name")}</p>
              <p>{t("controller.address")}</p>
              <p>{t("controller.city")}</p>
              <p>{t("controller.country")}</p>
              <p>
                {t("controller.emailLabel")}{" "}
                <a
                  href={`mailto:${t("controller.email")}`}
                  className="text-primary hover:underline"
                >
                  {t("controller.email")}
                </a>
              </p>
            </address>
            <p className="text-sm text-muted-foreground">
              {t("controller.impressumNote")}{" "}
              <Link href="/impressum" className="text-primary hover:underline">
                {t("controller.impressumLink")}
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" aria-hidden="true" />
              {t("overview.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("overview.description")}
            </p>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">
                {t("overview.keyPoint")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("overview.keyPointDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Server logs / hosting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" aria-hidden="true" />
              {t("hosting.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("hosting.description")}
            </p>
            <LegalBasis>{t("hosting.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Cookies and local storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" aria-hidden="true" />
              {t("cookies.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("cookies.description")}
            </p>
            <div className="space-y-3">
              {(["locale", "theme", "consent", "chat"] as const).map((key) => (
                <div key={key} className="p-3 border rounded-lg space-y-1">
                  <h3 className="font-medium text-sm">
                    {t(`cookies.${key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`cookies.${key}.description`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(`cookies.${key}.retention`)}
                  </p>
                </div>
              ))}
            </div>
            <LegalBasis>{t("cookies.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Analytics — consent-gated */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" aria-hidden="true" />
              {t("analytics.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("analytics.description")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("analytics.dataCollected")}
            </p>
            <LegalBasis>{t("analytics.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Consent controls — Art. 7(3) DSGVO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              {t("controls.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("controls.description")}
            </p>
            <PrivacyControls />
          </CardContent>
        </Card>

        {/* AI chatbot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" aria-hidden="true" />
              {t("chatbot.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("chatbot.description")}
            </p>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">{t("chatbot.alwaysTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("chatbot.alwaysDescription")}
              </p>
            </div>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">{t("chatbot.storedTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("chatbot.storedDescription")}
              </p>
            </div>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">{t("chatbot.aiNoticeTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("chatbot.aiNoticeDescription")}
              </p>
            </div>
            <LegalBasis>{t("chatbot.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Other AI-backed tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" aria-hidden="true" />
              {t("aiTools.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("aiTools.description")}
            </p>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">{t("aiTools.emailTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("aiTools.emailDescription")}
              </p>
            </div>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">{t("aiTools.auditTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("aiTools.auditDescription")}
              </p>
            </div>
            <LegalBasis>{t("aiTools.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" aria-hidden="true" />
              {t("booking.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("booking.description")}
            </p>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">
                {t("booking.calendlyTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("booking.calendlyDescription")}
              </p>
            </div>
            <LegalBasis>{t("booking.legalBasis")}</LegalBasis>
          </CardContent>
        </Card>

        {/* Art. 13(1)(e)-(f) — recipients and third-country transfers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" aria-hidden="true" />
              {t("recipients.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("recipients.description")}
            </p>
            <div className="space-y-3">
              {(["vercel", "openai", "groq", "calendly"] as const).map(
                (key) => (
                  <Recipient
                    key={key}
                    name={t(`recipients.${key}.name`)}
                    purpose={t(`recipients.${key}.purpose`)}
                    location={t(`recipients.${key}.location`)}
                  />
                ),
              )}
            </div>
            <div className="p-4 rounded-lg border space-y-2">
              <p className="text-sm font-medium">
                {t("recipients.transfersTitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("recipients.transfersDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Art. 13(2)(a) — retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" aria-hidden="true" />
              {t("retention.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("retention.description")}
            </p>
            <div className="grid gap-2">
              {(
                ["serverLogs", "chatSessions", "chatRecords", "browser"] as const
              ).map((key) => (
                <div key={key} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p className="text-sm">{t(`retention.${key}`)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Art. 13(2)(b)-(d) — data subject rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" aria-hidden="true" />
              {t("rights.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("rights.description")}
            </p>
            <div className="grid gap-2">
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
                <div key={key} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p className="text-sm">{t(`rights.${key}`)}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t("rights.howTo")}</p>
            <div className="p-4 rounded-lg border space-y-1">
              <p className="text-sm font-medium">{t("rights.complaintTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("rights.complaintDescription")}
              </p>
              <address className="not-italic text-sm text-muted-foreground">
                <p>{t("rights.authorityName")}</p>
                <p>{t("rights.authorityAddress")}</p>
                <p>{t("rights.authorityCity")}</p>
              </address>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" aria-hidden="true" />
              {t("changes.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("changes.description")}
            </p>
          </CardContent>
        </Card>

        <div className="text-center pt-6">
          <p className="text-xs text-muted-foreground">
            {t("lastUpdated")} {LAST_REVIEWED}
          </p>
        </div>
      </div>
    </div>
  );
}
