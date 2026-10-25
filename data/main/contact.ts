/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export const contactEmail = "contact@yazan-abo-ayash.de";

/** Opens the visitor's own mail app — no third-party service is involved. */
export const contactEmailLink = `mailto:${contactEmail}`;

/** The home page's closing contact section; the navbar's Contact action lands here. */
export const contactSectionHref = "/#contact";

/** Pre-filled email drafts offered in the contact section, in display order. */
export const contactTopics = ["role", "collaboration", "hello"] as const;
