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
      
      // Background space
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
          
          // Subtle connection lines for nodes near mouse
          float mDist = length(p - (m * 2.0));
          if(mDist < 0.3) {
              float alpha = smoothstep(0.3, 0.0, mDist);
              color += crystalColor * 0.1 * alpha;
          }
      }
      
      // Vignette
      color *= 1.0 - length(uv) * 0.5;
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

export function GalaxyShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
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

    // Compile Shaders
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

    // Set up buffers
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
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    function render(t: number) {
      if (!gl || !canvas) return;
      gl.useProgram(program);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render(0);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full galaxy-mask opacity-60 pointer-events-none"
      style={{ display: "block" }}
    />
  );
}
