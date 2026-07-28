/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaSquareInstagram,
  FaSquareXTwitter,
} from "react-icons/fa6";
import { socialLinks } from "@/data/main/footerLinks";
import { useTranslations } from "next-intl";
import { CTAButton } from "@/components/ui/cta-button";

interface ContactInfo {
  email: string;
  location: string;
  availability: string;
}

interface ContactSheetProps {
  children: React.ReactNode;
  contactInfo?: ContactInfo;
}

const defaultContactInfo: ContactInfo = {
  email: "contact@yazan-abo-ayash.de",
  location: "Germany",
  availability: "Available for hobby projects",
};

const iconMap = {
  FaGithub,
  FaLinkedin,
  FaInstagramSquare: FaSquareInstagram,
  FaSquareXTwitter,
};

export default function ContactSheet({
  children,
  contactInfo = defaultContactInfo,
}: ContactSheetProps) {
  const t = useTranslations("Contact");

  const handleSocialClick = (href: string, _label: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-87.5 sm:w-100 px-8"
        aria-label="Contact information"
      >
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            {t("getInTouch")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t("description")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Book a Meeting Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("schedule")}
            </h3>
            <CTAButton
              label={t("bookMeeting")}
              variant="default"
              className="w-full border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-sm px-4 py-2 h-auto cursor-pointer transition-colors duration-300"
            />
          </div>
          <Separator />
          {/* Social Media Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("socialMedia")}
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map((social) => {
                const IconComponent =
                  iconMap[social.icon as keyof typeof iconMap];
                if (!IconComponent) return null;

                // Get display name for social platform
                const getDisplayName = (label: string) => {
                  switch (label.toLowerCase()) {
                    case "x":
                      return "X";
                    case "github":
                      return "GitHub";
                    case "linkedin":
                      return "LinkedIn";
                    case "instagram":
                      return "Instagram";
                    case "spotify":
                      return "Spotify";
                    default:
                      return label;
                  }
                };

                return (
                  <div
                    key={social.label}
                    className="flex flex-col items-center"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 cursor-pointer"
                      onClick={() =>
                        handleSocialClick(social.href, social.label)
                      }
                      aria-label={
                        social.ariaLabel || `Visit ${social.label} profile`
                      }
                    >
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span className="text-xs text-muted-foreground mt-1">
                      {getDisplayName(social.label)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>{" "}
          <Separator />
          {/* Additional Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("info")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("location")}:</span>
                <Badge variant="outline" className="text-xs">
                  {contactInfo.location}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("status")}:</span>
                <Badge variant="secondary" className="text-xs">
                  {t("openForCollaboration")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Position:</span>
                <Badge variant="outline" className="text-xs">
                  Freelancer
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Position:</span>
                <Badge variant="outline" className="text-xs">
                  Botgenossen GmbH
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("training")}:</span>
                <Badge variant="secondary" className="text-xs">
                  Graduated from GFN
                </Badge>
              </div>
            </div>
          </div>
          <Separator />
        </div>
      </SheetContent>
    </Sheet>
  );
}
