/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { certifications } from "@/data/main/certificationsData";
import {
  CertificationShowcaseDesktop,
  CertificationShowcaseMobile,
} from "@/components/cer";
import { useCertificationShowcaseLogic } from "@/components/cer/CertificationShowcase.logic";

interface CertificationShowcaseProps {
  readonly className?: string;
}

function CertificationShowcase({ className }: CertificationShowcaseProps) {
  const logic = useCertificationShowcaseLogic();

  // Render appropriate UI based on device type
  const shouldShowDesktop = !logic.isMobile && !logic.isTablet;

  if (shouldShowDesktop) {
    return (
      <CertificationShowcaseDesktop
        certifications={certifications}
        logic={logic}
        className={className}
      />
    );
  }

  return (
    <CertificationShowcaseMobile
      certifications={certifications}
      logic={logic}
      className={className}
    />
  );
}

export default CertificationShowcase;
