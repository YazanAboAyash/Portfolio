/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { CentralizedLoading } from "@/components/visuals";

export default function Loading() {
  return (
    <CentralizedLoading
      variant="page"
      title="Loading Portfolio..."
      description="Please wait while we prepare your experience"
    />
  );
}
