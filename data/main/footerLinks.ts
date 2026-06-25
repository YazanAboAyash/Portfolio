/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

export interface LinkItem {
  href: string;
  label: string;
  icon?: string;
  ariaLabel?: string;
  isExternal?: boolean;
  variant?: "text" | "social" | "credit";
}

export const legalLinks: LinkItem[] = [
  { href: "/impressum", label: "Impressum" },
  { href: "/privacy", label: "Privacy" },
];

export const footerNavLinks: LinkItem[][] = [
  [
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
  ],
];

export const developerLinks: LinkItem[] = [
  { href: "/about-portfolio", label: "About This Site" },
  {
    href: "https://docs.coldbydefault.com/",
    label: "Documentation",
    isExternal: true,
  },
];

export const socialLinks: LinkItem[] = [
  {
    href: "https://x.com/ccoldbydefault",
    label: "X",
    icon: "FaSquareXTwitter",
    ariaLabel: "Follow ColdByDefault on X (Twitter)",
    isExternal: true,
    variant: "social" as const,
  },
  {
    href: "https://www.instagram.com/cold.by.default",
    label: "Instagram",
    icon: "FaInstagramSquare",
    ariaLabel: "Follow ColdByDefault on Instagram",
    isExternal: true,
    variant: "social" as const,
  },
  {
    href: "https://github.com/yazanaboayash",
    label: "GitHub",
    icon: "FaGithub",
    ariaLabel: "Visit ColdByDefault GitHub profile",
    isExternal: true,
    variant: "social" as const,
  },
  {
    href: "https://www.linkedin.com/in/yazan-a-a-465b44312/",
    label: "LinkedIn",
    icon: "FaLinkedin",
    ariaLabel: "Connect with ColdByDefault on LinkedIn",
    isExternal: true,
    variant: "social" as const,
  },
];
