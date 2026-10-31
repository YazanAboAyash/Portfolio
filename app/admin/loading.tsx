/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { CentralizedLoading } from "@/components/visuals";

export default function AdminLoading() {
  return (
    <CentralizedLoading
      variant="dashboard"
      title="Loading admin dashboard…"
      description="Preparing the admin interface"
    />
  );
}
