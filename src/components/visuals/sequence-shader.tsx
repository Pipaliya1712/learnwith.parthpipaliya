"use client";

import { useEffect, useRef } from "react";

const vs = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fs = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_active_count;
  varying vec2 v_texCoord;

  float roundedRect(vec2 p, vec2 b, float r) {
      vec2 d = abs(p) - b + r;
      return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  void main() {
      vec2 uv = v_texCoord;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_resolution.x / u_resolution.y;

      vec3 color = vec3(0.0);
      
      float spacing = 0.45;
      float width = 0.15;
      float height = 0.25;
      float cornerRadius = 0.04;
      
      for(float i = 0.0; i < 5.0; i++) {
          float xOffset = (i - 2.0) * spacing;
          vec2 blockPos = p - vec2(xOffset, 0.0);
          
          float phase = fract(u_time * 0.4);
          float blockIndex = floor(mod(i - floor(phase * 5.0), 5.0));
          
          vec3 blockColor;
          float alpha = 1.0;
          
          // Use uniform u_active_count to decide active blocks
          if (blockIndex < u_active_count) {
              blockColor = mix(vec3(0.055, 0.647, 0.914), vec3(0.078, 0.722, 0.651), i/4.0); // Cyan to Teal
              alpha = 1.0;
          } else {
              blockColor = vec3(0.2, 0.25, 0.33); // #334155
              alpha = 0.15;
          }

          float d = roundedRect(blockPos, vec2(width, height), cornerRadius);
          float mask = smoothstep(0.01, 0.0, d);
          
          if (blockIndex < u_active_count) {
              float glow = exp(-d * 10.0) * 0.3;
              color += blockColor * glow;
          }
          
          color = mix(color, blockColor, mask * alpha);
      }
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

interface SequenceShaderProps {
  activeCount?: number;
}

export function SequenceShader({ activeCount = 3 }: SequenceShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 150;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => syncSize());
      resizeObserver.observe(canvas);
    }
    syncSize();

    function compileShader(src: string, type: number): WebGLShader | null {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vertexShader = compileShader(vs, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fs, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uActiveCount = gl.getUniformLocation(program, "u_active_count");

    // Clamp activeCount between 0 and 5
    const clampedActiveCount = Math.max(0, Math.min(5, activeCount));

    function render(t: number) {
      if (!gl || !canvas) return;
      gl.useProgram(program);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uActiveCount) gl.uniform1f(uActiveCount, clampedActiveCount);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render(0);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (gl) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [activeCount]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
