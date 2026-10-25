/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  Home,
  FolderGit2,
  User,
  Library,
  Mail,
  Plug,
  Search,
} from "lucide-react";
import { ModeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/languages/language-switcher";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { contactSectionHref } from "@/data/main/contact";
import { useIsApplePlatform } from "@/hooks/use-search-palette";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface ContactCTA {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Square, borderless control in the bar: icon, or icon and label. */
export const NAV_TOOL =
  "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 px-3 text-[0.9375rem] font-semibold transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/** The one filled action in the bar. Overrides the Shadcn button through tailwind-merge. */
const NAV_ACTION =
  "h-10 rounded-none px-4 text-[0.9375rem] font-semibold shadow-none transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

export function useNavItems(): NavItem[] {
  const t = useTranslations("Navigation");

  return [
    {
      name: t("home"),
      href: "/",
      icon: Home,
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
      name: t("blog"),
      href: "/blog",
      icon: Library,
    },
    {
      name: t("mcp"),
      href: "/mcp",
      icon: Plug,
    },
  ];
}

export function useContactCTA(): ContactCTA {
  const t = useTranslations("Navigation");
  return {
    label: t("contact"),
    icon: Mail,
  };
}

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function DesktopNavigation({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-6 lg:flex">
      {navItems.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            className="link-draw py-1.5 text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Opens the Ctrl/⌘K palette; the label and shortcut hint show from `lg`. */
export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("Search");
  const isApple = useIsApplePlatform();
  const shortcut = isApple ? "⌘K" : "Ctrl K";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("triggerLabel", { shortcut })}
      aria-keyshortcuts={isApple ? "Meta+K" : "Control+K"}
      className={NAV_TOOL}
    >
      <Search className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      <span className="hidden xl:inline">{t("trigger")}</span>
      <kbd className="hidden bg-surface px-1.5 py-0.5 font-sans text-[0.8125rem] font-medium lg:inline">
        {shortcut}
      </kbd>
    </button>
  );
}

export function DesktopControls({ contactCTA }: { contactCTA: ContactCTA }) {
  return (
    <div className="hidden items-center gap-1 lg:flex">
      <LanguageSwitcher />
      <ModeToggle />
      <Button asChild className={`ml-2 ${NAV_ACTION}`}>
        <Link href={contactSectionHref}>{contactCTA.label}</Link>
      </Button>
    </div>
  );
}

export function MobileControls({ contactCTA }: { contactCTA: ContactCTA }) {
  return (
    <div className="flex items-center gap-1 lg:hidden">
      <ModeToggle />
      <Button asChild className={`ml-1 ${NAV_ACTION} px-3 sm:px-4`}>
        <Link href={contactSectionHref}>{contactCTA.label}</Link>
      </Button>
    </div>
  );
}

interface MobileNavigationProps {
  navItems: NavItem[];
  onLinkClick: () => void;
  contactCTA: ContactCTA;
}

export function MobileNavigation({
  navItems,
  onLinkClick,
  contactCTA,
}: MobileNavigationProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  return (
    <SheetContent
      side="right"
      className="w-75 gap-0 border-0 sm:w-100"
      id="mobile-menu"
      aria-label="Mobile navigation menu"
    >
      <SheetHeader className="px-6 pt-6">
        <SheetTitle className="text-lg font-bold">{t("navigation")}</SheetTitle>
      </SheetHeader>
      <div className="flex flex-col gap-8 px-6 pb-8">
        <ul className="flex flex-col">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={onLinkClick}
                aria-current={
                  isCurrent(pathname, item.href) ? "page" : undefined
                }
                className="-mx-3 block px-3 py-3 text-2xl font-semibold tracking-[-0.01em] transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-8"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between bg-surface px-4 py-2">
          <span className="text-base font-medium">{t("language")}</span>
          <LanguageSwitcher />
        </div>

        <Button asChild className={`w-full ${NAV_ACTION} h-12`}>
          <Link href={contactSectionHref} onClick={onLinkClick}>
            <contactCTA.icon className="h-4 w-4" aria-hidden="true" />
            {contactCTA.label}
          </Link>
        </Button>
      </div>
    </SheetContent>
  );
}

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      aria-label="ColdByDefault - Home"
    >
      <Image
        src="/logoLight.png"
        alt="ColdByDefault"
        width={120}
        height={40}
        priority
        unoptimized
        className="h-6 w-auto object-contain dark:hidden"
      />
      <Image
        src="/logoDark.png"
        alt="ColdByDefault"
        width={120}
        height={40}
        priority
        unoptimized
        className="hidden h-6 w-auto object-contain dark:block"
      />
      <span
        className="hidden text-lg font-bold tracking-[-0.01em] sm:inline"
        aria-hidden="true"
      >
        ColdByDefault
      </span>
    </Link>
  );
}
