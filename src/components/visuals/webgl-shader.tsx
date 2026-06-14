"use client";

import React, { useEffect, useRef } from "react";

interface WebGLShaderProps {
  type: "galaxy" | "streak";
  className?: string;
}

export function WebGLShader({ type, className }: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    // Compile shader helper
    const compileShader = (shaderType: number, source: string) => {
      const shader = gl.createShader(shaderType);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    // Vertex Shader Source
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader Source
    const fsSource =
      type === "galaxy"
        ? `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
          vec2 m = u_mouse / u_resolution - 0.5;
          
          vec3 color = vec3(0.02, 0.04, 0.1); // Deep Navy
          
          // Nebula glow
          float d = length(uv - m * 0.2);
          color += vec3(0.1, 0.2, 0.4) * exp(-d * 2.0);
          color += vec3(0.4, 0.1, 0.5) * exp(-length(uv + vec2(0.5, 0.3)) * 3.0) * 0.5;
          
          // Starfield/Nodes
          for(float i=0.0; i<60.0; i++) {
              float h = hash(vec2(i, 123.45));
              float speed = 0.1 + h * 0.2;
              vec2 p = vec2(sin(u_time * speed + h * 6.28), cos(u_time * speed * 0.8 + h * 6.28)) * 0.8;
              
              float dist = length(uv - p);
              float size = 0.002 + h * 0.005;
              
              vec3 crystalColor;
              if(h < 0.2) crystalColor = vec3(0.2, 0.4, 1.0); // Blue
              else if(h < 0.4) crystalColor = vec3(0.6, 0.2, 1.0); // Purple
              else if(h < 0.6) crystalColor = vec3(1.0, 0.2, 0.6); // Pink
              else if(h < 0.8) crystalColor = vec3(1.0, 0.8, 0.2); // Gold
              else crystalColor = vec3(0.7, 0.9, 1.0); // Diamond
              
              color += crystalColor * (size / dist) * (0.5 + 0.5 * sin(u_time + h * 10.0));
              
              float mDist = length(p - (m * 2.0));
              if(mDist < 0.3) {
                  float alpha = smoothstep(0.3, 0.0, mDist);
                  color += crystalColor * 0.1 * alpha;
              }
          }
          
          color *= 1.0 - length(uv) * 0.5;
          gl_FragColor = vec4(color, 1.0);
      }
    `
        : `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
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
              
              if (blockIndex < 3.0) {
                  blockColor = mix(vec3(0.055, 0.647, 0.914), vec3(0.078, 0.722, 0.651), i/4.0); // Cyan to Teal
                  alpha = 1.0;
              } else {
                  blockColor = vec3(0.2, 0.25, 0.33); // Inactive gray-blue
                  alpha = 0.15;
              }

              float d = roundedRect(blockPos, vec2(width, height), cornerRadius);
              float mask = smoothstep(0.01, 0.0, d);
              
              if (blockIndex < 3.0) {
                  float glow = exp(-d * 10.0) * 0.3;
                  color += blockColor * glow;
              }
              
              color = mix(color, blockColor, mask * alpha);
          }
          
          gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shader program
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Buffers
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = type === "galaxy" ? gl.getUniformLocation(program, "u_mouse") : null;

    // Track mouse
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    if (type === "galaxy") {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Handle Resize
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 1280;
      const h = rect.height || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);
    resizeCanvas();

    // Render loop
    const render = (time: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, time * 0.001);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (type === "galaxy") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [type]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
