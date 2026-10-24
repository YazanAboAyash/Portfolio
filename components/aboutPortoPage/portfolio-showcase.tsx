/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, ChevronRight } from "lucide-react";
import { codeExamples } from "@/data/hubs/portfolio-section.data";

export function CodeExamples() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          Code Examples & Implementation
        </CardTitle>
        <CardDescription>
          Real-world TypeScript code examples showcasing separation of concerns,
          custom hooks, and clean architecture patterns from the portfolio
          codebase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
            {codeExamples.map((example, index) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="text-xs bg-background cursor-pointer hover:bg-black/20 transition-colors flex items-center gap-1"
              >
                {example.title}
                <ChevronRight className="w-3 h-3" />
              </TabsTrigger>
            ))}
          </TabsList>
          {codeExamples.map((example, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <Badge variant="outline">{example.language}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/50">
                      <span className="text-sm font-medium">
                        {example.title}
                      </span>
                    </div>
                    <div className="p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-foreground whitespace-pre-wrap">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
