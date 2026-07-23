/* WebHub — WebGL Shader Background */

(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'shader-bg';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);

  const gl = canvas.getContext('webgl2', { alpha: false });
  if (!gl) { canvas.style.display = 'none'; return; }

  const vertSrc = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position=vec4(a_pos,0.0,1.0); }`;

  const fragSrc = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }

float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y);
  float t=u_time*0.15;

  float n1=noise(uv*2.5+vec2(t*0.3,0.0));
  float n2=noise(uv*3.0+vec2(-t*0.2,t*0.15));
  float n3=noise(uv*4.0+vec2(t*0.1,-t*0.2));

  float flow=sin(uv.x*4.0+t+n1*2.0)*cos(uv.y*3.5+t*0.8+n2*2.0);
  float line=abs(sin(uv.y*12.0+flow*2.0+t*0.5))*abs(cos(uv.x*10.0-flow+t*0.3));
  line=smoothstep(0.85,0.95,line)*smoothstep(0.0,0.08,line);

  float pulse=sin(length(uv)*6.0-t*2.0+n3)*0.5+0.5;
  pulse*=exp(-length(uv)*1.8);

  float dist=length(uv);
  float vignette=1.0-smoothstep(0.4,1.6,dist);

  vec3 gold=vec3(0.83,0.69,0.22);
  vec3 darkGold=vec3(0.6,0.45,0.1);
  vec3 bg=vec3(0.04,0.04,0.06);

  vec3 col=bg;
  col+=gold*line*0.25;
  col+=darkGold*pulse*0.15;
  col+=gold*vignette*n1*0.03;
  col=mix(col,darkGold,flow*0.05+0.02);

  fragColor=vec4(col,1.0);
}`;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) || 'shader error');
    }
    return sh;
  }

  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.floor((canvas.clientWidth || window.innerWidth) * dpr);
    const h = Math.floor((canvas.clientHeight || window.innerHeight) * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    resize();
    const t = now * 0.001;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
})();
