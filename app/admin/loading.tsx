/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { getTranslations } from "next-intl/server";
import { CentralizedLoading } from "@/components/visuals";

export default async function AdminLoading() {
  const t = await getTranslations("Loading.admin");

  return (
    <CentralizedLoading
      variant="dashboard"
      title={t("title")}
      description={t("description")}
    />
  );
}
