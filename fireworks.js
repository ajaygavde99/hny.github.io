// Fireworks animation script
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createFirework() {
const gl = canvas.getContext('webgl2');
if (!gl) { alert('WebGL 2 required'); }

const vs = `#version 300 es
in vec2 a;
void main(){ gl_Position=vec4(a,0,1); }`;

const fs = `#version 300 es
precision highp float;
uniform vec3  iResolution;
uniform float iTime;
uniform vec4  iMouse;
out vec4 fragColor;

/* -----------  YOUR ORIGINAL SHADER  ------------ */
#define rad(x) radians(x)
#define np 50.
#define snp 40.
#define spawn 1
#define trail 1

vec2 N22(vec2 p){
    vec3 a = fract(p.xyx*vec3(123.34, 234.34, 345.65));
    a += dot(a, a+34.45);
    return fract(vec2(a.x*a.y, a.y*a.z));
}
float hash(vec2 uv){
    return fract(sin(dot(uv,vec2(154.45,64.548))) * 124.54); 
}

vec3 particle(vec2 st, vec2 p, float r, vec3 col){
    float d = length(st-p);
    d = smoothstep(r, r-2.0/iResolution.y, d);
    return d*col;
}
vec3 burst(vec2 st, vec2 pos, float r, vec3 col, int heart) {
    st -= pos;
    if (heart==1) st.y -= sqrt(abs(st.x))*0.1;
    r *=0.6*r;
    return (r/dot(st, st))*col*0.6;
}

vec2 get_pos(vec2 u, vec2 a, vec2 p0, float t, float ang){
    ang = rad(ang);
    vec2 d = p0 + vec2(u.x*cos(ang), u.y*sin(ang))*t + 0.5*a*t*t;
    return d;
}
vec2 get_velocity(vec2 u, vec2 a, float t, float ang){
    ang = rad(ang);
    return vec2(u.x*cos(ang), u.y*sin(ang)) + a*t;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    vec2 uv = (2.*fragCoord-iResolution.xy)/iResolution.y;
    vec3 col = vec3(0.0);
    float t = mod(iTime, 10.);
    
    float r = 0.04;
    vec2 u = vec2(5.);
    vec2 a = vec2(0.0, -9.8);
    float ang = 75.0;

    vec3 p1 = vec3(0.0);
    
    for (float i=0.; i<np; i++){
        vec2 rand = N22(vec2(i));
        vec2 ip = vec2(sin(15.*rand.x), -1.+r);
        u = vec2(sin(5.*rand.x), 5.+sin(4.*rand.y));
        float t1 = t-i/5.;
        vec2 s = get_pos(u, a, ip, t1, ang);
        vec2 v = get_velocity(u, a, t1, ang);
        float Tf = 2.0*u.y*sin(rad(ang))/abs(a.y);
        vec2 H = get_pos(u, a, ip, Tf/2.0, ang);
        vec3 pcol = vec3(sin(22.*rand.x), sin(5.*rand.y), sin(1.*rand.x));

        if (v.y<-0.5){ r=0.0; }
        p1 += burst(uv, s, r, pcol, 0);

        if (trail==1){
            for (float k=4.0; k>0.0; k--){
                vec2 strail = get_pos(u, a, ip, t1-(k*0.02), ang);
                p1 += burst(uv, strail, v.y<-0.5?0.0:r-(k*0.006), pcol, 0);
            }
        }
        
        if (v.y<=0.0 && t1>=Tf/2.0 && spawn==1){
            for (float j=0.0; j<snp; j++){
                vec2 rand2 = N22(vec2(j));
                float ang2 = (j*(360./snp));
                r = 0.035;
                r -= (t1-Tf*0.5)*0.04;
                float x = cos(rad(ang2));
                float y = sin(rad(ang2));
                y = y + abs(x) * sqrt( (8.- abs(x))/50.0 );
                vec2 heart = vec2(x*x + y*y)*(0.4/(t1*sqrt(t1)));
                vec2 S = get_pos(heart, a*0.03, H, t1-(Tf/2.), ang2);
                pcol = vec3(sin(8.*rand2.x), sin(6.*rand2.y), sin(2.*rand2.x));
                p1 += burst(uv, S, max(0.0,r), pcol, 0);
            }
        } 
    }
    
    float stars = pow(hash(uv),200.) * 0.5;
    col = p1;
    vec3 night = vec3(0.06, 0.02, 0.18)*vec3(uv.y*0.5+0.5)+vec3(stars)*vec3(uv.y*0.5+0.5);
    col += night*(1.0-p1);
    fragColor = vec4(col,1.0);
}
/* ----------------------------------------------- */

void main(){ mainImage(fragColor, gl_FragCoord.xy); }
`;

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
// The WebGL shader-based heart fireworks are initialized and animated automatically above.
requestAnimationFrame(frame);
}

function animate() {
// The WebGL shader-based heart fireworks are initialized and animated automatically above.
}
