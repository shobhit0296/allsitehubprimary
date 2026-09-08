'use client';

import { useEffect, useRef } from 'react';
import { THEMES } from '@/lib/theme';

const VERTEX_SRC = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_bg_color;
uniform vec3 u_accent_color;
uniform vec3 u_accent2_color;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Deep matte black base color from theme
    vec3 color = u_bg_color;

    // Ultra-smooth lightweight silk waves with gentle matte diffusion
    for (float i = 1.0; i <= 2.0; i++) {
        p.x += (0.32 / i) * sin(i * 2.2 * p.y + u_time * 0.20);
        p.y += (0.32 / i) * cos(i * 2.2 * p.x + u_time * 0.20);

        float dist = length(p);
        float glow = 0.020 / max(dist, 0.06);

        vec3 accent = mix(u_accent_color, u_accent2_color, sin(u_time * 0.18 + i * 1.5) * 0.5 + 0.5) * glow;
        color += accent * (0.65 / i);
    }

    // Ultra-subtle matte ambient micro-texture
    vec2 grid = fract(gl_FragCoord.xy / min(u_resolution.x, u_resolution.y) * 36.0);
    float line = step(0.985, grid.x) + step(0.985, grid.y);
    color += line * u_accent_color * 0.015;

    gl_FragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  try {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  } catch {
    return null;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power',
      }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

      if (!gl || !(gl instanceof WebGLRenderingContext)) return;

      // Handle WebGL context loss gracefully (common in mobile Safari on tab switch)
      const onContextLost = (e: Event) => {
        e.preventDefault();
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);

      const syncSize = () => {
        try {
          const clientW = canvas.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280);
          const clientH = canvas.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 720);
          const scale = Math.min(0.5, 720 / Math.max(clientW, 1));
          const w = Math.max(320, Math.floor(clientW * scale));
          const h = Math.max(180, Math.floor(clientH * scale));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
        } catch {
          // ignore
        }
      };

      let ro: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        try {
          ro = new ResizeObserver(syncSize);
          ro.observe(canvas);
        } catch {
          // ignore
        }
      }
      syncSize();

      const vertShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
      const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
      if (!vertShader || !fragShader) return;

      const program = gl.createProgram();
      if (!program) return;

      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return;
      }
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(program, 'u_time');
      const uRes = gl.getUniformLocation(program, 'u_resolution');
      const uBg = gl.getUniformLocation(program, 'u_bg_color');
      const uAccent = gl.getUniformLocation(program, 'u_accent_color');
      const uAccent2 = gl.getUniformLocation(program, 'u_accent2_color');

      // Theme color management with smooth interpolation
      const getThemeColors = (themeId: string) => {
        const found = THEMES.find(t => t.id === themeId) || THEMES[0];
        return {
          bg: [...found.bgRgb] as [number, number, number],
          accent: [...found.accentRgb] as [number, number, number],
          accent2: [...found.accent2Rgb] as [number, number, number],
        };
      };

      const initialTheme = document.documentElement.getAttribute('data-theme') || 'cosmic';
      let current = getThemeColors(initialTheme);
      let target = getThemeColors(initialTheme);

      // Watch for data-theme changes on documentElement
      const observer = new MutationObserver(() => {
        const nextTheme = document.documentElement.getAttribute('data-theme') || 'cosmic';
        target = getThemeColors(nextTheme);
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      let raf = 0;
      let isVisible = true;

      const onVisibilityChange = () => {
        isVisible = !document.hidden;
        if (isVisible && !raf) {
          raf = requestAnimationFrame(render);
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      const render = (t: number) => {
        try {
          if (!isVisible || gl.isContextLost()) {
            raf = 0;
            return;
          }
          if (!ro) syncSize();
          gl.viewport(0, 0, canvas.width, canvas.height);

          // Smooth color lerp towards target theme
          const speed = 0.08;
          for (let i = 0; i < 3; i++) {
            current.bg[i] = lerp(current.bg[i], target.bg[i], speed);
            current.accent[i] = lerp(current.accent[i], target.accent[i], speed);
            current.accent2[i] = lerp(current.accent2[i], target.accent2[i], speed);
          }

          gl.uniform1f(uTime, t * 0.001);
          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform3fv(uBg, current.bg);
          gl.uniform3fv(uAccent, current.accent);
          gl.uniform3fv(uAccent2, current.accent2);

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          raf = requestAnimationFrame(render);
        } catch {
          raf = 0;
        }
      };
      raf = requestAnimationFrame(render);

      return () => {
        try {
          if (raf) cancelAnimationFrame(raf);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          canvas.removeEventListener('webglcontextlost', onContextLost);
          observer.disconnect();
          ro?.disconnect();
        } catch {
          // ignore
        }
      };
    } catch {
      // If WebGL is completely disabled or unsupported, fail silently to CSS background
    }
  }, []);

  return (
    <div className="shader-bg" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
