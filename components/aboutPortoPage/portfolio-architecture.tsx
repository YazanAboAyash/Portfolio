/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Layers, Folder, Code2, Globe } from "lucide-react";
import {
  infrastructureNodes,
  applicationNodes,
  dataNodes,
  routeStructure,
  componentStructure,
} from "@/data/hubs/portfolio-section.data";
import type { ArchitectureNode } from "@/types/hubs/portfolio-section.types";

export function ArchitectureDiagram() {
  const renderArchitectureLayer = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    nodes: ArchitectureNode[],
    description: string,
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {React.createElement(icon, { className: "w-5 h-5 text-primary" })}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="grid gap-3">
        {nodes.map((node, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 ${node.color} rounded-lg p-4 border transition-all hover:shadow-sm`}
          >
            <node.icon className="w-6 h-6 shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{node.title}</h4>
              <p className="text-sm opacity-80 line-clamp-2">{node.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRouteStructure = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">App Router Structure</h3>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          <span className="font-mono text-sm">
            {routeStructure.rootLayout.path}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {routeStructure.rootLayout.features.map((feature) => (
            <Badge key={feature} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {routeStructure.routeGroups.map((group) => (
          <div key={group.name} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-blue-500" />
              <code className="font-mono text-sm font-semibold">
                {group.name}
              </code>
              <span className="text-xs text-muted-foreground">
                - {group.description}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{group.layout}</p>
            <div className="flex flex-wrap gap-1">
              {group.routes.map((route) => (
                <Badge key={route} variant="secondary" className="text-xs">
                  {route}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
          <Globe className="w-4 h-4" />
          API Routes
        </h4>
        <div className="flex flex-wrap gap-1">
          {routeStructure.apiRoutes.map((route) => (
            <Badge key={route} variant="outline" className="text-xs font-mono">
              {route}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComponentStructure = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Component Architecture</h3>
      </div>

      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 mb-3">
        <p className="font-medium text-sm mb-1">
          Pattern: {componentStructure.pattern}
        </p>
        <p className="text-xs text-muted-foreground">
          Separation of concerns with logic hooks, utilities, and pure UI
          components
        </p>
      </div>

      <div className="space-y-3">
        {componentStructure.structure.map((item, index) => (
          <div key={index} className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-purple-500" />
              <code className="font-mono text-sm font-semibold">
                {item.folder}
              </code>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {item.description}
              </p>
            )}
            {item.files && (
              <div className="space-y-1">
                {item.files.map((file) => (
                  <div
                    key={file}
                    className="text-xs font-mono bg-muted/50 rounded px-2 py-1"
                  >
                    {file}
                  </div>
                ))}
              </div>
            )}
            {item.examples && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.examples.map((example) => (
                  <Badge
                    key={example}
                    variant="secondary"
                    className="text-xs font-mono"
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-6 h-6" />
          Next.js 16 Application Architecture
        </CardTitle>
        <CardDescription>
          Comprehensive architecture showcasing App Router, route groups, server
          components, cookie-driven locale handling, and React 19.2.x patterns
          with strict TypeScript implementation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Infrastructure Layer */}
        {renderArchitectureLayer(
          "Infrastructure Layer",
          Globe,
          infrastructureNodes,
          "Edge-first infrastructure with global CDN distribution and security middleware",
        )}

        <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />

        {/* Application Layer */}
        {renderArchitectureLayer(
          "Application Layer",
          Code2,
          applicationNodes,
          "Next.js 16 App Router with advanced routing patterns, server components, and component architecture",
        )}

        <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />

        {/* Route Structure Details */}
        {renderRouteStructure()}

        <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />

        {/* Component Structure */}
        {renderComponentStructure()}

        <ArrowDown className="w-6 h-6 text-muted-foreground mx-auto" />

        {/* Data Layer */}
        {renderArchitectureLayer(
          "Data & API Layer",
          Layers,
          dataNodes,
          "Type-safe data layer with Prisma ORM, internationalization, and external API integrations",
        )}
      </CardContent>
    </Card>
  );
}
