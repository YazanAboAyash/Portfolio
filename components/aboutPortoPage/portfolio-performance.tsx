/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { CheckCircle } from "lucide-react";
import { performanceMetrics } from "@/data/hubs/portfolio-section.data";

export function PerformanceMetrics() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {performanceMetrics.map((metric, index) => {
        const titleId = `performance-metric-title-${index}`;

        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle id={titleId} className="text-lg">
                      {metric.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {metric.score}%
                  </div>
                  <Progress
                    value={metric.score}
                    className="w-16 h-2 mt-1"
                    aria-labelledby={titleId}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {metric.description}
              </CardDescription>
              <ul className="text-sm space-y-2">
                {metric.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-green-500 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
