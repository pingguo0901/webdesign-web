/* WebHub — WebGL Shader Background (from document) */
(function() {
  'use strict';
  try {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.4';
    document.body.insertBefore(c, document.body.firstChild);

    const gl = c.getContext('webgl2', { alpha: false, premultipliedAlpha: false }) || c.getContext('webgl');
    if (!gl) return;

    // Vertex shader — fullscreen quad
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) throw new Error('vs');

    // Fragment shader — animated procedural background
    const isGL2 = gl.getParameter(gl.VERSION).includes('2.0') === false;
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, (isGL2 ? '#version 300 es\nprecision highp float;\nout vec4 O;\n' : 'precision highp float;\n') + `
uniform vec2 r;
uniform float t;

float H(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float N(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),u.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),u.x),u.y);}
float F(vec2 p){float a=0.,b=1.;for(int i=0;i<6;i++){a+=b*N(p);p*=2.;b*=.5;}return a;}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  float d=length(uv),T=t*.12;
  float n=F(uv*2.5+vec2(T*.3,sin(T*.2)));
  float w=abs(sin(uv.y*8.+n*3.+T))*abs(cos(uv.x*6.-n+T*.5));
  w=smoothstep(.7,.9,w);
  float v=1.-smoothstep(.4,1.6,d);
  vec3 G=vec3(.83,.69,.22);
  vec3 col=vec3(.04,.04,.06)+G*w*.2+G*v*N(uv+T)*.03;
  ${isGL2 ? 'O' : 'gl_FragColor'}=vec4(col,1);
}`);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn('shader compile failed, skipping bg');
      return;
    }

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
  } catch(e) { /* silently skip */ }
})();
