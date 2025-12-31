import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef } from "react"

export default function FinalScreen() {
    useEffect(() => {
        // Heart WebGL shader effect from heart.js
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            const canvas = document.getElementById('c');
            const gl = canvas.getContext('webgl2');
            if (!gl) { alert('WebGL 2 required'); }

            const vs = `#version 300 es\nin vec2 a;\nvoid main(){ gl_Position=vec4(a,0,1); }`;
            const fs = `#version 300 es\nprecision highp float;\nuniform vec3  iResolution;\nuniform float iTime;\nuniform vec4  iMouse;\nout vec4 fragColor;\n#define rad(x) radians(x)\n#define np 50.\n#define snp 40.\n#define spawn 1\n#define trail 1\nvec2 N22(vec2 p){\n    vec3 a = fract(p.xyx*vec3(123.34, 234.34, 345.65));\n    a += dot(a, a+34.45);\n    return fract(vec2(a.x*a.y, a.y*a.z));\n}\nfloat hash(vec2 uv){\n    return fract(sin(dot(uv,vec2(154.45,64.548))) * 124.54); \n}\nvec3 particle(vec2 st, vec2 p, float r, vec3 col){\n    float d = length(st-p);\n    d = smoothstep(r, r-2.0/iResolution.y, d);\n    return d*col;\n}\nvec3 burst(vec2 st, vec2 pos, float r, vec3 col, int heart) {\n    st -= pos;\n    if (heart==1) st.y -= sqrt(abs(st.x))*0.1;\n    r *=0.6*r;\n    return (r/dot(st, st))*col*0.6;\n}\nvec2 get_pos(vec2 u, vec2 a, vec2 p0, float t, float ang){\n    ang = rad(ang);\n    vec2 d = p0 + vec2(u.x*cos(ang), u.y*sin(ang))*t + 0.5*a*t*t;\n    return d;\n}\nvec2 get_velocity(vec2 u, vec2 a, float t, float ang){\n    ang = rad(ang);\n    return vec2(u.x*cos(ang), u.y*sin(ang)) + a*t;\n}\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ){\n    vec2 uv = (2.*fragCoord-iResolution.xy)/iResolution.y;\n    vec3 col = vec3(0.0);\n    float t = mod(iTime, 10.);\n    float r = 0.04;\n    vec2 u = vec2(5.);\n    vec2 a = vec2(0.0, -9.8);\n    float ang = 75.0;\n    vec3 p1 = vec3(0.0);\n    for (float i=0.; i<np; i++){\n        vec2 rand = N22(vec2(i));\n        vec2 ip = vec2(sin(15.*rand.x), -1.+r);\n        u = vec2(sin(5.*rand.x), 5.+sin(4.*rand.y));\n        float t1 = t-i/5.;\n        vec2 s = get_pos(u, a, ip, t1, ang);\n        vec2 v = get_velocity(u, a, t1, ang);\n        float Tf = 2.0*u.y*sin(rad(ang))/abs(a.y);\n        vec2 H = get_pos(u, a, ip, Tf/2.0, ang);\n        vec3 pcol = vec3(sin(22.*rand.x), sin(5.*rand.y), sin(1.*rand.x));\n        if (v.y<-0.5){ r=0.0; }\n        p1 += burst(uv, s, r, pcol, 0);\n        if (trail==1){\n            for (float k=4.0; k>0.0; k--){\n                vec2 strail = get_pos(u, a, ip, t1-(k*0.02), ang);\n                p1 += burst(uv, strail, v.y<-0.5?0.0:r-(k*0.006), pcol, 0);\n            }\n        }\n        if (v.y<=0.0 && t1>=Tf/2.0 && spawn==1){\n            for (float j=0.0; j<snp; j++){\n                vec2 rand2 = N22(vec2(j));\n                float ang2 = (j*(360./snp));\n                r = 0.035;\n                r -= (t1-Tf*0.5)*0.04;\n                float x = cos(rad(ang2));\n                float y = sin(rad(ang2));\n                y = y + abs(x) * sqrt( (8.- abs(x))/50.0 );\n                vec2 heart = vec2(x*x + y*y)*(0.4/(t1*sqrt(t1)));\n                vec2 S = get_pos(heart, a*0.03, H, t1-(Tf/2.), ang2);\n                pcol = vec3(sin(8.*rand2.x), sin(6.*rand2.y), sin(2.*rand2.x));\n                p1 += burst(uv, S, max(0.0,r), pcol, 0);\n            }\n        } \n    }\n    float stars = pow(hash(uv),200.) * 0.5;\n    col = p1;\n    vec3 night = vec3(0.06, 0.02, 0.18)*vec3(uv.y*0.5+0.5)+vec3(stars)*vec3(uv.y*0.5+0.5);\n    col += night*(1.0-p1);\n    fragColor = vec4(col,1.0);\n}\nvoid main(){ mainImage(fragColor, gl_FragCoord.xy); }`;

            function compile(type, src) {
              const s = gl.createShader(type);
              gl.shaderSource(s, src);
              gl.compileShader(s);
              if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
                console.error(gl.getShaderInfoLog(s));
              return s;
            }
            const prog = gl.createProgram();
            gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
            gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
            gl.linkProgram(prog);
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, 'a');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, 0, 0, 0);

            const uni = {
              res : gl.getUniformLocation(prog, 'iResolution'),
              time: gl.getUniformLocation(prog, 'iTime'),
              mouse: gl.getUniformLocation(prog, 'iMouse')
            };

            function resize() {
              canvas.width  = window.innerWidth;
              canvas.height = window.innerHeight;
              gl.viewport(0, 0, canvas.width, canvas.height);
            }
            window.addEventListener('resize', resize);
            resize();

            let mx = 0, my = 0, mz = 0;
            canvas.addEventListener('mousemove', e => { mx = e.clientX; my = canvas.height - e.clientY; });
            canvas.addEventListener('mousedown', () => mz = 1);
            canvas.addEventListener('mouseup',   () => mz = 0);

            function frame(t) {
              gl.uniform3f(uni.res, canvas.width, canvas.height, 1.0);
              gl.uniform1f(uni.time, t * 0.001);
              gl.uniform4f(uni.mouse, mx, my, mz, 0);
              gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
              requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        `;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return (
        <motion.div
            className="flex flex-col items-center justify-center h-full w-full text-center px-2"
        >
            {/* GIF */}
            <motion.div
                className="w-40 h-40 p-4 rounded-full bg-pink-900/10 border-2 border-pink-400/25 backdrop-blur-sm flex items-center justify-center overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Image
                    loading="lazy"
                    src='/gifs/cute.gif'
                    width={130}
                    height={130}
                    alt='cute gif'
                    className='object-contain'
                    unoptimized
                />
            </motion.div>
            {/* Final Text */}
            <motion.h2
                className="mt-8 text-3xl md:text-4xl font-dancing-script text-zinc-50 font-medium leading-tight"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                You’ll always be special to me
                Happy New Year Babe! ❤️
            </motion.h2>
            {/* Heart WebGL Canvas */}
            <canvas
                id="c"
                style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 0 }}
            />
        </motion.div>
    )
}