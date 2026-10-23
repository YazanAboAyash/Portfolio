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
import { Progress } from "@/components/ui/progress";

import { techStacks } from "@/data/hubs/portfolio-section.data";

export function TechStackGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {techStacks.map((stack, index) => {
        const titleId = `tech-stack-title-${index}`;

        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stack.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle id={titleId} className="text-lg">
                    {stack.title}
                  </CardTitle>
                  {stack.level && (
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={stack.level}
                        className="w-16 h-2"
                        aria-labelledby={titleId}
                      />
                      <span className="text-xs text-muted-foreground">
                        {stack.level}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {stack.description}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                {stack.technologies.map((tech, techIndex) => (
                  <Badge
                    key={techIndex}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
