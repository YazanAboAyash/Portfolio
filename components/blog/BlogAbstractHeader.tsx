/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const VERTEX = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform int u_mode;
uniform vec4 u_shape;   // scale, warp, angle, detail
uniform vec2 u_offset;
uniform vec3 u_pointer; // xy in view units, z strength
uniform vec3 u_bg;
uniform vec3 u_ink;

out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// Pixel to pattern space: aspect-correct, pushed by the pointer, then rotated, scaled, offset
vec2 toPattern(vec2 frag) {
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  vec2 d = p - u_pointer.xy;
  p += d * u_pointer.z * 0.35 * exp(-dot(d, d) * 10.0);
  float c = cos(u_shape.z);
  float s = sin(u_shape.z);
  return mat2(c, -s, s, c) * p * u_shape.x + u_offset;
}

// Domain-warped fbm, roughly 0..1
float field(vec2 p) {
  float t = u_time;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  return smoothstep(0.2, 0.8, fbm(p + u_shape.y * q + t * 0.5));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = toPattern(frag);
  float v;

  if (u_mode == 0) {
    // Ink: soft tonal smoke
    v = pow(field(p), 1.6) * 0.9;
  } else if (u_mode == 1) {
    // Silk: the same smoke stretched into long streaks
    v = pow(field(p * vec2(1.0, u_shape.w)), 1.4) * 0.9;
  } else {
    // Marble: tonal smoke crossed by soft veins that follow the flow
    float f = field(p);
    float veins = pow(1.0 - abs(sin(f * u_shape.w)), 2.5);
    v = pow(f, 1.8) * 0.8 + veins * 0.22;
  }

  // A little grain keeps the gradients from banding
  v += (hash(frag) - 0.5) * 0.04;
  outColor = vec4(mix(u_bg, u_ink, clamp(v, 0.0, 1.0)), 1.0);
}`;

/** Per-style ranges; `detail` is the silk stretch or the marble vein count. */
const STYLES = [
  { scale: [1.2, 2.4], warp: [1.5, 3.5], detail: [0, 0] }, // ink
  { scale: [0.8, 1.6], warp: [1.5, 3.0], detail: [2.5, 4.5] }, // silk
  { scale: [1.0, 2.0], warp: [1.5, 3.0], detail: [4, 8] }, // marble
] as const;

/** FNV-1a hash of the seed string. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32: a small seeded PRNG returning floats in [0, 1). */
function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createArtwork(seed: string) {
  const hash = hashSeed(seed);
  const random = seededRandom(hash);
  const mode = Math.floor(random() * STYLES.length);
  const style = STYLES[mode] ?? STYLES[0];
  const pick = ([min, max]: readonly [number, number]) =>
    min + random() * (max - min);

  return {
    hash,
    mode,
    scale: pick(style.scale),
    warp: pick(style.warp),
    detail: pick(style.detail),
    angle: random() * Math.PI * 2,
    offsetX: random() * 100 - 50,
    offsetY: random() * 100 - 50,
    speed: 0.04 + random() * 0.04,
    start: random() * 100,
  };
}

/** A neutral `oklch(L 0 0)` token as an sRGB gray triple. */
function readGray(
  style: CSSStyleDeclaration,
  token: string,
  fallback: number,
): [number, number, number] {
  const match = /oklch\(\s*([\d.]+)(%?)/.exec(style.getPropertyValue(token));
  if (!match?.[1]) return [fallback, fallback, fallback];
  const linear = (Number(match[1]) / (match[2] ? 100 : 1)) ** 3;
  const gray =
    linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return [gray, gray, gray];
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

interface BlogAbstractHeaderProps {
  /** Same seed, same artwork: posts pass their slug. */
  seed: string;
  className?: string;
}

/**
 * Generated monochrome shader artwork used in place of a cover image. Drawn in
 * the theme's surface and foreground grays, drifting slowly and bending around
 * the pointer. Pauses off screen and renders one still frame under reduced
 * motion; a seeded line pattern shows until the first frame or without WebGL2.
 */
export function BlogAbstractHeader({ seed, className }: BlogAbstractHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const art = useMemo(() => createArtwork(seed), [seed]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", {
      antialias: false,
      powerPreference: "low-power",
    });
    if (!container || !canvas || !gl) return;
    const program = createProgram(gl);
    if (!program) return;

    // One triangle that covers the viewport
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: uniform("u_res"),
      time: uniform("u_time"),
      pointer: uniform("u_pointer"),
      bg: uniform("u_bg"),
      ink: uniform("u_ink"),
    };
    gl.uniform1i(uniform("u_mode"), art.mode);
    gl.uniform4f(uniform("u_shape"), art.scale, art.warp, art.angle, art.detail);
    gl.uniform2f(uniform("u_offset"), art.offsetX, art.offsetY);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
    };
    const readColors = () => {
      const style = getComputedStyle(container);
      gl.uniform3fv(loc.bg, readGray(style, "--surface", 0.97));
      gl.uniform3fv(loc.ink, readGray(style, "--foreground", 0.15));
    };

    const pointer = { x: 0, y: 0, amount: 0, toX: 0, toY: 0, toAmount: 0 };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    let last = 0;
    let elapsed = art.start;

    const draw = () => {
      gl.uniform1f(loc.time, elapsed);
      gl.uniform3f(loc.pointer, pointer.x, pointer.y, pointer.amount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = "";
    };
    const tick = (now: number) => {
      elapsed += (Math.min(100, now - last) / 1000) * art.speed;
      last = now;
      pointer.x += (pointer.toX - pointer.x) * 0.08;
      pointer.y += (pointer.toY - pointer.y) * 0.08;
      pointer.amount += (pointer.toAmount - pointer.amount) * 0.05;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame || !visible || reducedMotion.matches) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.toX = (event.clientX - rect.left - rect.width / 2) / rect.height;
      pointer.toY = (rect.height / 2 - (event.clientY - rect.top)) / rect.height;
      pointer.toAmount = 1;
    };
    const onPointerLeave = () => {
      pointer.toAmount = 0;
    };
    const onMotionChange = () => (reducedMotion.matches ? stop() : start());
    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      delete canvas.dataset.ready;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    });
    // The theme toggle flips a class on <html>; redraw in the new grays
    const themeObserver = new MutationObserver(() => {
      readColors();
      draw();
    });

    resize();
    readColors();
    draw();
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    reducedMotion.addEventListener("change", onMotionChange);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      reducedMotion.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [art]);

  const angle = Math.round((art.angle * 180) / Math.PI);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("relative overflow-hidden border border-border bg-surface", className)}
      style={{
        backgroundImage: `repeating-linear-gradient(${angle}deg, color-mix(in oklch, var(--foreground) 12%, transparent) 0 1px, transparent 1px 14px)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100 motion-reduce:transition-none"
      />
      <span className="absolute bottom-3 left-3 bg-background/85 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        #{art.hash.toString(16).padStart(8, "0").slice(0, 6)} /{" "}
        {String(art.mode + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
