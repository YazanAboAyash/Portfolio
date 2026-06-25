/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { useCaseProjects } from "@/data/hubs/use-cases";
import { ProjectCard } from "./project-card";
import Link from "next/link";
import { Button } from "../ui/button";

export function ShowcaseSection() {
  const t = useTranslations("Usecases");
  const tLive = useTranslations("Usecases.liveToolsShowcase");

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-175 text-muted-foreground md:text-xl text-pretty">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {useCaseProjects.map((project) => (
            <div
              key={project.id}
              className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 justify-center border max-w-xl mx-auto p-6 rounded-lg bg-background/70 backdrop-blur-sm">
          <p className="text-center text-muted-foreground max-w-md font-semibold">
            {tLive("description")}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/automation-audit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="default"
                className="gap-2 cursor-pointer hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {tLive("auditButton")}
              </Button>
            </Link>
            <Link
              href="/rio-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="default"
                className="gap-2 cursor-pointer hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {tLive("rioButton")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
