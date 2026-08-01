/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Button } from "@/components/ui/button";
import { SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  Home,
  Briefcase,
  FolderGit2,
  User,
  Library,
  Contact,
  Calendar,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "@/components/languages/language-switcher";
import { ContactSheet } from "@/components/contact";
import { useTranslations } from "next-intl";
import { CTAButton } from "@/components/ui/cta-button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface DesktopNavigationProps {
  navItems: NavItem[];
  lightLink: string;
  darkLink: string;
}

interface MobileControlsProps {
  onMenuToggle?: () => void;
  bookingCTA: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  onLinkClick?: () => void;
}

interface DesktopControlsProps {
  bookingCTA: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

export function useNavItems(): NavItem[] {
  const t = useTranslations("Navigation");

  return [
    {
      name: t("home"),
      href: "/",
      icon: Home,
    },
    {
      name: t("services"),
      href: "/services",
      icon: Briefcase,
    },
    {
      name: t("work"),
      href: "/projects",
      icon: FolderGit2,
    },
    {
      name: t("about"),
      href: "/about",
      icon: User,
    },
    {
      name: "Blogs",
      href: "/blog",
      icon: Library,
    },
  ];
}

export function useBookingCTA() {
  const t = useTranslations("Navigation");
  return {
    label: t("bookCall"),
    icon: Calendar,
  };
}

export function DesktopNavigation({
  navItems,
  lightLink,
  darkLink,
}: DesktopNavigationProps) {
  return (
    <div
      className="hidden lg:flex items-center space-x-2 xl:space-x-6"
      role="menubar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className={`
              group flex items-center space-x-2 text-sm font-medium transition-colors
              ${lightLink} ${darkLink}
              focus:outline-none px-2 py-1
            `}
            role="menuitem"
            aria-label={`Navigate to ${item.name} section`}
          >
            <div className="flex items-center space-x-1 xl:space-x-2 min-w-0">
              <Icon
                className="h-4 w-4 transition-colors duration-300 group-hover:text-blue-100 shrink-0"
                aria-hidden={true}
              />
              <div className="relative overflow-hidden max-w-20 xl:max-w-none">
                <div className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                  <span className="block truncate xl:whitespace-nowrap text-xs xl:text-sm">
                    {item.name}
                  </span>
                </div>
                <div className="absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                  <span className="block truncate xl:whitespace-nowrap text-xs xl:text-sm">
                    {item.name}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function DesktopControls({ bookingCTA }: DesktopControlsProps) {
  return (
    <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm">
      <div className="border-r pr-1 xl:border-r-2 xl:pr-2">
        <ContactSheet>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open contact information"
            className="cursor-pointer hover:text-sky-600 transition-colors duration-300 h-8 w-8 xl:h-10 xl:w-10"
          >
            <Contact className="h-3 w-3 xl:h-4 xl:w-4" aria-hidden={true} />
          </Button>
        </ContactSheet>
      </div>
      <div className="border-r pr-1 xl:border-r-2 xl:pr-2">
        <ModeToggle />
      </div>
      <div className="border-r pr-1 xl:border-r-2 xl:pr-2">
        <LanguageSwitcher />
      </div>
      <div className="hidden xl:block">
        <CTAButton
          label={bookingCTA.label}
          variant="default"
          className="border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-sm px-4 py-2 h-auto cursor-pointer transition-colors duration-300"
        />
      </div>
      <div className="xl:hidden">
        <CTAButton
          label="Book"
          variant="default"
          className="border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-xs px-3 py-1.5 h-auto cursor-pointer transition-colors duration-300"
        />
      </div>
    </div>
  );
}

export function MobileControls({
  onMenuToggle: _onMenuToggle,
}: MobileControlsProps) {
  return (
    <div className="flex lg:hidden items-center space-x-1 sm:space-x-2 px-2 sm:px-4">
      <ModeToggle />
      <div className="hidden sm:block">
        <CTAButton
          label="Book"
          size="sm"
          variant="outline"
          className="border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-xs px-3 py-1 h-8 cursor-pointer transition-colors duration-300"
        />
      </div>
      <div className="sm:hidden">
        <CTAButton
          label="Book"
          size="sm"
          variant="outline"
          showIcon={false}
          className="border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-xs px-2 py-1 h-7 cursor-pointer transition-colors duration-300"
        />
      </div>
    </div>
  );
}

interface MobileNavigationProps {
  navItems: NavItem[];
  onLinkClick: () => void;
  bookingCTA: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

export function MobileNavigation({
  navItems,
  onLinkClick,
  bookingCTA,
}: MobileNavigationProps) {
  const t = useTranslations("Navigation");

  return (
    <SheetContent
      side="right"
      className="w-75 sm:w-100"
      id="mobile-menu"
      aria-label="Mobile navigation menu"
    >
      <SheetHeader>
        <SheetTitle className="text-lg font-semibold mb-4 pl-2">
          {t("navigation")}
        </SheetTitle>
      </SheetHeader>
      <div className="flex flex-col space-y-4 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={onLinkClick}
              className="flex items-center space-x-3 text-sm font-medium p-3 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Navigate to ${item.name} section`}
            >
              <Icon className="h-5 w-5" aria-hidden={true} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Mobile-only controls */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
            <span className="text-sm font-medium">{t("language")}</span>
            <LanguageSwitcher />
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4 border-t">
          <CTAButton
            label={bookingCTA.label}
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 py-3 cursor-pointer transition-colors duration-300"
            onClick={onLinkClick}
          />
        </div>
      </div>
    </SheetContent>
  );
}

export function BrandLogo() {
  return (
    <div className="flex items-center">
      <Link
        href="/"
        className="pl-4 flex items-center"
        aria-label="ColdByDefault - Home"
      >
        <Image
          src="/logoLight.png"
          alt="ColdByDefault"
          width={120}
          height={40}
          priority
          unoptimized
          className="h-8 w-auto dark:hidden object-contain"
          style={{ mixBlendMode: "normal" }}
        />
        <Image
          src="/logoDark.png"
          alt="ColdByDefault"
          width={120}
          height={40}
          priority
          unoptimized
          className="h-8 w-auto hidden dark:block object-contain"
          style={{ mixBlendMode: "normal" }}
        />
      </Link>
    </div>
  );
}
