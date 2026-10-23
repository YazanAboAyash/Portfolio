/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface ImplementationAreasProps {
  implementationAreasKey: string;
}

export function ImplementationAreas({
  implementationAreasKey,
}: ImplementationAreasProps) {
  const t = useTranslations("Usecases");
  const tData = useTranslations();

  // Get the implementation areas text and split by comma
  const areasText = tData(implementationAreasKey);
  const areas = areasText.split(", ").map((area: string) => area.trim());

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        {t("useCasesLabel")}
      </h4>
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => (
          <Badge key={area} variant="outline" className="font-normal">
            {area}
          </Badge>
        ))}
      </div>
    </div>
  );
}
