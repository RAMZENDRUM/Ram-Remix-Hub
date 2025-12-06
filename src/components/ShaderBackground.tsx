"use client";

import React, { useEffect, useRef } from "react";

const ShaderBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) return;

        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform float time;
            uniform vec2 resolution;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                uv = uv * 2.0 - 1.0;
                uv.x *= resolution.x / resolution.y;

                vec3 color = vec3(0.0);
                
                // Animated background
                float t = time * 0.5;
                
                // Create some moving plasma-like blobs
                for(float i = 0.0; i < 3.0; i++) {
                    uv.x += sin(uv.y * 2.0 + t + i) * 0.3;
                    uv.y += cos(uv.x * 3.0 - t + i * 2.0) * 0.3;
                    float d = length(uv);
                    color += vec3(0.1 / d) * vec3(0.5 + 0.5 * sin(t + i), 0.5 + 0.5 * cos(t + i * 0.5), 0.8);
                }

                // Darken specifically for background usage
                color *= 0.15;
                
                // Add subtle noise/grain if user wants "shader" feeel
                // (Simplified for performance)

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return;
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, "position");
        const matchResolutionLocation = gl.getUniformLocation(program, "resolution");
        const timeLocation = gl.getUniformLocation(program, "time");

        let animationFrameId: number;

        const render = (time: number) => {
            time *= 0.001; // convert to seconds

            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                // Force lower resolution on high DPI screens for performance
                const dpr = Math.min(window.devicePixelRatio, 1.5);
                canvas.width = canvas.clientWidth * dpr;
                canvas.height = canvas.clientHeight * dpr;
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            }

            gl.useProgram(program);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(matchResolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(timeLocation, time);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameId = requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
};

export default ShaderBackground;
