/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { Links } from "@/components/footer";
import {
  legalLinks,
  developerLinks,
  footerNavLinks,
} from "@/data/main/footerLinks";
import { SiVercel } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";
import VersionDisplay from "@/components/VersionDisplay";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-background/95 backdrop-blur border-t min-h-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {footerNavLinks.map((columnLinks, columnIndex) => (
                <ul key={columnIndex} className="space-y-2">
                  {columnLinks.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Links links={[link]} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              For Developers
            </h3>
            <ul className="space-y-2">
              {developerLinks.map((link, index) => (
                <li key={index}>
                  <Links links={[link]} />
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Links links={[link]} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 gap-4">
            {/* Powered By Section */}
            <div className="flex items-center gap-4 sm:flex-1 justify-center sm:justify-start">
              <span className="text-xs text-muted-foreground">Powered by</span>
              <div className="flex items-center gap-3">
                <Link
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-400 hover:text-foreground transition-colors"
                  aria-label="Vercel"
                >
                  <SiVercel className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-medium">Vercel</span>
                </Link>
                <Link
                  href="https://neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-400 hover:text-[#00E599] transition-colors"
                  aria-label="Neon"
                >
                  <Image
                    src="/assets/icons/neon.png"
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">Neon</span>
                </Link>
              </div>
            </div>

            {/* Version Section */}
            <div className="flex items-center justify-center sm:flex-1">
              <VersionDisplay
                prefix="v"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-foreground transition-colors"
              />
            </div>

            {/* Copyright Section */}
            <div className="text-xs text-gray-500 dark:text-gray-400 sm:flex-1">
              <div className="flex flex-col text-center sm:text-right">
                <span>
                  2024-{currentYear} Yazan Abo-Ayash&#174;. All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
