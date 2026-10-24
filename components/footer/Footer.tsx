/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { Links } from "@/components/footer";
import {
  legalLinks,
  developerLinks,
  footerNavLinks,
  socialLinks,
} from "@/data/main/footerLinks";
import { contactEmailLink } from "@/data/main/contact";
import { SiVercel } from "react-icons/si";
import { FaGithub } from "react-icons/fa";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import VersionDisplay from "@/components/VersionDisplay";
import type { LinkItem } from "@/data/main/footerLinks";

const COLUMN_LINK =
  "inline-block py-1 text-base text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground";

/** The two places to reach me: body size, set apart by an icon, not by scale. */
const PLACE_LINK =
  "inline-flex w-fit items-center gap-2 py-1 text-base font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground wrap-break-word";

function FooterColumn({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-bold">{title}</h3>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Links links={[link]} linkClassName={COLUMN_LINK} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Social links by name, for the text column; the icon form stays in `Links`. */
const elsewhereLinks: LinkItem[] = socialLinks.map(
  ({ icon: _icon, ...link }) => link,
);

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tHero = await getTranslations("Hero");
  const currentYear = new Date().getFullYear();
  const email = contactEmailLink.replace("mailto:", "");
  const github = socialLinks.find((link) => link.label === "GitHub");

  return (
    <footer className="w-full bg-surface">
      <div className="frame grid grid-cols-12 gap-x-6 gap-y-14 pt-20 pb-24 md:pt-28">
        {/* Name, role and the two places to reach me */}
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5"
              aria-label="ColdByDefault - Home"
            >
              <Image
                src="/logoLight.png"
                alt=""
                width={120}
                height={40}
                unoptimized
                className="h-6 w-auto object-contain dark:hidden"
              />
              <Image
                src="/logoDark.png"
                alt=""
                width={120}
                height={40}
                unoptimized
                className="hidden h-6 w-auto object-contain dark:block"
              />
              <span className="text-xl font-bold tracking-[-0.015em]">
                ColdByDefault
              </span>
            </Link>
            <p className="text-base text-muted-foreground">
              Yazan Abo-Ayash · {tHero("fullStackDeveloper")}
            </p>
          </div>
          <div className="flex flex-col">
            <a href={contactEmailLink} className={PLACE_LINK}>
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {email}
            </a>
            {github && (
              <a
                href={github.href}
                target="_blank"
                rel="noopener noreferrer"
                className={PLACE_LINK}
              >
                <FaGithub className="h-4 w-4 shrink-0" aria-hidden="true" />
                {github.href.replace("https://", "")}
              </a>
            )}
          </div>
          <Links
            links={socialLinks}
            className="flex items-center gap-3 text-xl"
            linkClassName="p-1 text-foreground transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-foreground"
          />
        </div>

        {/* Link columns */}
        <nav
          aria-label={t("label")}
          className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-7"
        >
          {footerNavLinks.map((columnLinks, columnIndex) => (
            <FooterColumn
              key={columnIndex}
              title={t("navigation")}
              links={columnLinks}
            />
          ))}
          <FooterColumn title={t("developers")} links={developerLinks} />
          <FooterColumn title={t("elsewhere")} links={elsewhereLinks} />
          <FooterColumn title={t("legal")} links={legalLinks} />
        </nav>

        {/* Powered by, version, copyright */}
        <div className="col-span-12 flex flex-col gap-4 pt-6 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span>{t("poweredBy")}</span>
            <Link
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
              aria-label="Vercel"
            >
              <SiVercel className="h-4 w-4" aria-hidden="true" />
              Vercel
            </Link>
            <Link
              href="https://neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
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
              Neon
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>
              2024–{currentYear} Yazan Abo-Ayash&#174;. {t("rights")}
            </span>
            <VersionDisplay prefix="v" className="font-medium tabular-nums" />
            <a
              href="#main-content"
              className="font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
