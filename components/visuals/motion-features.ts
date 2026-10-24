/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

// Re-export domAnimation in a standalone module so webpack puts the heavy
// animation engine in a separate async chunk (loaded after first paint).
export { domAnimation } from "framer-motion";
