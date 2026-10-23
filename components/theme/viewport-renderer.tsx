/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useIsClient } from "@/hooks/use-client";
import { isDeploymentAuthorized } from "./theme-config-validator";

/**
 * Viewport Renderer Component
 * Handles viewport-specific rendering optimizations
 */
export function ViewportRenderer() {
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    // Print security info to console if unauthorized
    const isAuthorized = isDeploymentAuthorized();
    if (!isAuthorized) {
      printSecurityInformation();
    }
  }, [isClient]);

  // Only render on client-side and if unauthorized
  if (!isClient) return null;

  const showOverlay = !isDeploymentAuthorized();
  if (!showOverlay) return null;

  return (
    <>
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center px-4 py-3 z-999998 font-sans text-sm font-semibold shadow-lg">
        ⚠️ UNAUTHORIZED DEPLOYMENT - This is a stolen copy. Original site:{" "}
        <Link
          href="https://www.coldbydefault.com"
          className="text-white underline font-bold hover:text-gray-100 transition-colors"
        >
          www.coldbydefault.com
        </Link>
      </div>

      {/* Diagonal Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-999997 overflow-hidden">
        <div className="-rotate-45 text-[120px] font-black text-red-600/8 select-none tracking-[20px] whitespace-nowrap font-sans">
          UNAUTHORIZED COPY
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-red-500 text-center px-4 py-2 z-999998 font-mono text-xs">
        © 2026 ColdByDefault - All Rights Reserved - Unauthorized use is
        prohibited
      </div>

      {/* Corner Watermarks */}
      {[
        { top: "80px", left: "20px", rotation: -15 },
        { top: "80px", right: "20px", rotation: 15 },
        { bottom: "60px", left: "20px", rotation: 15 },
        { bottom: "60px", right: "20px", rotation: -15 },
      ].map((pos, idx) => (
        <div
          key={idx}
          className="fixed text-red-600/40 font-mono text-[11px] font-bold pointer-events-none z-999996"
          style={{
            ...pos,
            transform: `rotate(${pos.rotation}deg)`,
            textShadow: "0 0 3px rgba(0,0,0,0.3)",
          }}
        >
          STOLEN FROM
          <br />
          COLDBYDEFAULT
        </div>
      ))}

      {/* Random Scattered Watermarks */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`scatter-${i}`}
          className="fixed text-red-600/15 font-mono text-[10px] font-semibold pointer-events-none z-999995 select-none"
          style={{
            top: `${10 + ((i * 6) % 80)}%`,
            left: `${5 + ((i * 7) % 90)}%`,
            transform: `rotate(${(i * 37) % 360}deg)`,
          }}
        >
          UNAUTHORIZED
        </div>
      ))}
    </>
  );
}

/**
 * Prints security and deployment information to console
 */
function printSecurityInformation() {
  if (typeof window === "undefined") return;

  const deploymentId = btoa(window.location.hostname).slice(0, 16);

  // Main security banner
  const banner = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              🛡️  SECURITY SYSTEM ACTIVE  🛡️                   ║
║                                                                ║
║  © 2026 ColdByDefault - All Rights Reserved                   ║
║  Portfolio Code - Proprietary and Confidential                ║
║                                                                ║
║  ⚠️  UNAUTHORIZED DEPLOYMENT DETECTED  ⚠️                      ║
║                                                                ║
║  This code is running on an unauthorized domain.              ║
║  Legal action may be taken against unauthorized use.          ║
║                                                                ║
║  Deployment ID: ${deploymentId}...                            ║
║  Domain: ${window.location.hostname.padEnd(45)}║
║  Timestamp: ${new Date().toISOString().padEnd(42)}║
║                                                                ║
║  Original site: https://www.coldbydefault.com                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `;

  console.log(banner);

  // Large warning
  console.log(
    "%c UNAUTHORIZED DEPLOYMENT DETECTED ⚠️",
    "color: #dc2626; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);",
  );

  console.log(
    "%cThis is an unauthorized copy of ColdByDefault's portfolio.",
    "color: #dc2626; font-size: 16px; font-weight: bold;",
  );

  console.log(
    "%cUnauthorized use, reproduction, or distribution is strictly prohibited.",
    "color: #ef4444; font-size: 14px;",
  );

  console.log(
    "%c\n📧 If you're interested in working with ColdByDefault, visit the official site:\n🌐 https://www.coldbydefault.com",
    "color: #3b82f6; font-size: 13px; font-style: italic;",
  );

  // Intimidation footer
  console.log(
    "%c\n  Legal Notice: This deployment has been logged and reported.",
    "color: #dc2626; font-size: 12px; font-weight: bold; background: #fee; padding: 4px;",
  );

  // Table with details
  console.table({
    "Unauthorized Domain": window.location.hostname,
    "Authorized Domain": "www.coldbydefault.com",
    Status: "❌ UNAUTHORIZED",
    "Detected At": new Date().toLocaleString(),
    "User Agent": navigator.userAgent.slice(0, 50) + "...",
  });
}
