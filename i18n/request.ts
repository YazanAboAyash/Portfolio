/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import type { LocaleModule } from "@/types/configs/i18n";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/data/configs/i18n";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("PORTFOLIOVERSIONLATEST_LOCALE")?.value;

  // Validate that the locale exists in our supported languages
  const supportedLocales: readonly string[] = SUPPORTED_LOCALES;
  const locale =
    localeCookie && supportedLocales.includes(localeCookie)
      ? localeCookie
      : DEFAULT_LOCALE;

  const localeModule = (await import(
    `../messages/${locale}.json`
  )) as LocaleModule;

  return {
    locale,
    messages: localeModule.default,
  };
});
