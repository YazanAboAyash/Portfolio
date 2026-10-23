/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { CentralizedLoading } from "@/components/visuals";

export default function MediaLoading() {
  return (
    <CentralizedLoading
      variant="page"
      title="Loading Legals..."
      description="Preparing legal content for you"
    />
  );
}
