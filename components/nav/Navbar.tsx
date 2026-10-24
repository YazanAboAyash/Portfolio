/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchPalette } from "@/hooks/use-search-palette";
import SearchPalette from "./SearchPalette";
import {
  NAV_TOOL,
  useNavItems,
  useContactCTA,
  DesktopNavigation,
  DesktopControls,
  MobileControls,
  MobileNavigation,
  BrandLogo,
  SearchTrigger,
} from "./navbarItems";

/**
 * A plain bar: mark and name, four links, then the tools — search, language,
 * theme, contact details — and the one filled action. No border, no blur; the
 * bar is the page's own ground.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = useNavItems();
  const contactCTA = useContactCTA();
  const search = useSearchPalette();
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <nav
        className="frame flex h-16 items-center gap-8"
        aria-label="Main navigation"
      >
        <BrandLogo />

        <DesktopNavigation navItems={navItems} />

        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger onOpen={() => search.setOpen(true)} />

          <DesktopControls contactCTA={contactCTA} />

          <MobileControls contactCTA={contactCTA} />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t("openMenu")}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                className={`${NAV_TOOL} lg:hidden`}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <MobileNavigation
              navItems={navItems}
              onLinkClick={() => setIsOpen(false)}
              contactCTA={contactCTA}
            />
          </Sheet>
        </div>
      </nav>

      <SearchPalette open={search.open} onOpenChange={search.setOpen} />
    </header>
  );
}
