/* WebHub — Starry Sky Shader Background */

(function() {
  try {
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

float star(vec2 uv, float seed, float size, float speed){
  vec2 pos=vec2(hash(vec2(seed,0.0)),hash(vec2(0.0,seed)));
  vec2 starPos=pos*2.0-1.0;
  pos.x+=u_time*speed*hash(vec2(seed,seed));
  pos=fract(pos);
  vec2 starUV=uv-starPos*2.0+1.0;
  float d=length(starUV*starUV*starUV)*10.0;
  float twinkle=sin(u_time*3.0+seed*100.0)*0.3+0.7;
  return smoothstep(1.2,0.0,d/size)*twinkle;
}

void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y);
  float t=u_time;

  // Deep space gradient
  vec3 col=mix(vec3(0.01,0.01,0.08),vec3(0.02,0.02,0.15),uv.y*0.5+0.5);

  // Nebula clouds
  float n1=hash(floor(uv*3.0+t*0.05));
  float nebula=smoothstep(0.7,0.0,length(uv-vec2(0.3-n1*0.6,0.1+n1*0.2)));
  col+=vec3(0.04,0.02,0.12)*nebula*0.5;

  float n2=hash(floor(uv*2.5-t*0.03));
  float nebula2=smoothstep(0.8,0.0,length(uv-vec2(-0.4+n2*0.8,-0.3+n2*0.6)));
  col+=vec3(0.06,0.03,0.08)*nebula2*0.4;

  // Stars — layers of different sizes and speeds
  for(float i=0.0;i<60.0;i++){
    float s=200.0+mod(i,6.0)*100.0;
    col+=vec3(0.9,0.95,1.0)*star(uv,i,s,0.02+i*0.001)*0.8;
  }

  // Bright big stars
  for(float i=0.0;i<15.0;i++){
    col+=vec3(1.0,0.95,0.85)*star(uv,i+1000.0,100.0+500.0*i,0.005)*0.9;
  }

  // Blue-white bright stars
  for(float i=0.0;i<8.0;i++){
    col+=vec3(0.7,0.8,1.0)*star(uv,i+2000.0,50.0+400.0*i,0.008)*1.0;
  }

  // Vignette
  float vig=1.0-smoothstep(0.3,1.5,length(uv));
  col*=vig;

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
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
  } catch(e) { console.warn('Shader bg failed, continuing without it'); }
})();
