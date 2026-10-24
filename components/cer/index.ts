/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

// Main component (orchestrator)
export { default as CertificationShowcase } from "./CertificationShowCase";

// UI Components
export { CertificationShowcaseDesktop } from "./CertificationShowcaseDesktop";
export { CertificationShowcaseMobile } from "./CertificationShowcaseMobile";

// Logic hook
export {
  useCertificationShowcaseLogic,
  type CertificationShowcaseLogic,
} from "./CertificationShowcase.logic";
