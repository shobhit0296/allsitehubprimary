'use client';

import { useEffect, useRef } from 'react';
import { THEMES } from '@/lib/theme';

const VERTEX_SRC = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SRC = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_bg_color;
uniform vec3 u_accent_color;
uniform vec3 u_accent2_color;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Dynamic background color from theme
    vec3 color = u_bg_color;

    // Animated glowing clouds/nebula
    for (float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + u_time * 0.35);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + u_time * 0.35);

        float dist = length(p);
        float glow = 0.028 / max(dist, 0.04);

        // Mix between primary accent and secondary accent
        vec3 accent = mix(u_accent_color, u_accent2_color, sin(u_time * 0.3 + i * 1.5) * 0.5 + 0.5) * glow;
        color += accent * (1.0 / i);
    }

    // Subtle grid overlay
    vec2 grid = fract(gl_FragCoord.xy / min(u_resolution.x, u_resolution.y) * 40.0);
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    color += line * u_accent_color * 0.08;

    gl_FragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return;

    const syncSize = () => {
      const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
      const w = Math.floor((canvas.clientWidth || 1280) * dpr);
      const h = Math.floor((canvas.clientHeight || 720) * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncSize);
      ro.observe(canvas);
    }
    syncSize();

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC));
    gl.linkProgram(program);
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
      if (!isVisible) {
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
    };
    raf = requestAnimationFrame(render);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      ro?.disconnect();
    };
  }, []);

  return (
    <div className="shader-bg transform-gpu pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
