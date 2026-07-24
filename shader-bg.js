/* WebHub — Futuristic Starfield Shader */
(function() {
  'use strict';
  try {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:-1;display:block';
    document.body.prepend(c);

    const gl = c.getContext('webgl2', { alpha: false }) || c.getContext('webgl');
    if (!gl) return;

    const isGL2 = !gl.getParameter(gl.VERSION).includes('2.0');

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return;

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, (isGL2 ? '#version 300 es\nprecision highp float;\nout vec4 O;\n' : 'precision highp float;\n') + `
uniform vec2 r;
uniform float t;

float H(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float N(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),u.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),u.x),u.y);}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  vec2 q=gl_FragCoord.xy/r;

  // Deep space nebula — blue/purple tones
  vec3 col=vec3(0.01,0.005,0.03);
  col+=vec3(0.02,0.04,0.12)*N(uv*0.5+t*0.02)*2.;
  col+=vec3(0.06,0.02,0.1)*N(uv*0.7-vec2(t*0.015,0.))*1.8;
  col+=vec3(0.03,0.06,0.08)*N(uv*0.35+vec2(0.,t*0.01))*1.5;

  // Stars — 3 layers
  for(int L=0;L<3;L++){
    float s=pow(2.,float(L));
    vec2 grid=floor(uv*s*vec2(16.,9.))+0.5;
    vec2 id=grid/s/vec2(16.,9.);
    for(int x=-1;x<=1;x++)
    for(int y=-1;y<=1;y++){
      vec2 cell=id+vec2(float(x),float(y))/s/vec2(16.,9.);
      float h=H(cell*float(100+L*31));
      vec2 off=vec2(H(cell*float(200+L*47))-.5,H(cell*float(300+L*59))-.5)*0.55;
      vec2 sp=cell+off/s/vec2(16.,9.);
      float d=length(uv-sp);
      float sz=0.0018+0.0025*h/s;
      float br=h*h*h;
      float tw=sin(t*(2.+h*3.)+h*6.28)*.25+.75;
      float a=smoothstep(sz,sz*.2,d);
      a*=br*tw;
      // Cool → warm star colors
      float tt=H(cell*400.);
      vec3 sc=mix(vec3(0.5,0.8,1.0),vec3(1.0,0.7,0.5),tt);
      sc=mix(sc,vec3(1.0),h*.3);
      col+=sc*a*1.0;
    }
  }

  // Big bright stars (fewer)
  for(int i=0;i<20;i++){
    float fi=float(i);
    vec2 sp=vec2(H(vec2(fi,0.))*2.-1.,H(vec2(0.,fi))*2.-1.)*1.2;
    float d=length(uv-sp);
    float sz=0.003+0.005*H(vec2(fi,fi));
    float tw=sin(t*(1.5+H(vec2(fi,fi))*2.)+fi)*.3+.7;
    float a=exp(-d*d/(sz*sz))*tw*H(vec2(fi,fi+1.));
    vec3 sc=mix(vec3(0.6,0.9,1.),vec3(1.,0.85,0.5),H(vec2(fi,fi+2.)));
    col+=sc*a*0.7;
  }

  // Shooting stars
  float st=mod(t*.25,22.);
  for(int j=0;j<2;j++){
    float fj=float(j)*11.;
    float sf=mod(st+fj,22.);
    vec2 pos=vec2(H(vec2(fj,1.))*.7,H(vec2(fj,2.))*.4-.1);
    float shoot=exp(-abs(length(uv-pos-sf*0.04)-sf*0.015)*120.);
    shoot*=step(0.,sf)*step(sf,18.)*smoothstep(18.,16.,sf);
    col+=vec3(0.8,0.9,1.)*shoot*.8;
  }

  // Subtle scan lines for future-tech feel
  col+=sin(q.y*800.)*0.003;

  // Vignette
  col*=1.-length(uv)*0.35;

  ${isGL2 ? 'O' : 'gl_FragColor'}=vec4(col,1);
}`);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return;

    const pg = gl.createProgram();
    gl.attachShader(pg, vs); gl.attachShader(pg, fs);
    gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return;
    gl.useProgram(pg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pg, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(pg, 'r');
    const uT = gl.getUniformLocation(pg, 't');

    function size() {
      const px = Math.max(1, Math.min(2, devicePixelRatio || 1));
      const w = Math.floor((c.clientWidth || innerWidth) * px);
      const h = Math.floor((c.clientHeight || innerHeight) * px);
      if (c.width !== w || c.height !== h) {
        c.width = w; c.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    (function draw(now) {
      size();
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform1f(uT, now * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(draw);
    })(performance.now());

    addEventListener('resize', size, { passive: true });
  } catch(e) {}
})();
