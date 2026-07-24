/* WebHub — Starfield Shader Background */
(function() {
  'use strict';
  try {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none';
    document.body.insertBefore(c, document.body.firstChild);

    const gl = c.getContext('webgl2', { alpha: false }) || c.getContext('webgl');
    if (!gl) return;

    const isGL2 = !gl.getParameter(gl.VERSION).includes('2.0');

    // Vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return;

    // Fragment shader — starfield with nebula
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, (isGL2 ? '#version 300 es\nprecision highp float;\nout vec4 O;\n' : 'precision highp float;\n') + `
uniform vec2 r;
uniform float t;

float H(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float N(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),u.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),u.x),u.y);}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  vec2 q=gl_FragCoord.xy/r;
  
  // Deep space gradient
  vec3 bg=vec3(0.02,0.01,0.04);
  vec3 nebula1=vec3(0.04,0.02,0.08)*N(uv*0.6+t*0.03)*1.5;
  vec3 nebula2=vec3(0.06,0.03,0.1)*N(uv*0.4-vec2(t*0.02,0.))*1.2;
  vec3 col=bg+nebula1+nebula2;
  
  // Stars — layers at different scales
  for(int L=0;L<3;L++){
    float s=pow(2.,float(L));
    vec2 grid=floor(uv*s*vec2(16.,9.))+0.5;
    vec2 id=grid/s/vec2(16.,9.);
    
    for(int x=-1;x<=1;x++)
    for(int y=-1;y<=1;y++){
      vec2 cell=id+vec2(float(x),float(y))/s/vec2(16.,9.);
      float h=H(cell*float(100+L*31));
      vec2 offset=vec2(H(cell*float(200+L*47))-0.5,H(cell*float(300+L*59))-0.5)*0.5;
      vec2 starPos=cell+offset/s/vec2(16.,9.);
      float dist=length(uv-starPos);
      
      float size=0.0015+0.002*h/s;
      float brightness=h*h*h*h;
      
      // Twinkling
      float twinkle=sin(t*(2.+h*3.)+h*6.28)*0.3+0.7;
      float alpha=1.-smoothstep(0.,size,dist);
      alpha*=1.-smoothstep(size*0.3,size,dist);
      alpha*=brightness*twinkle;
      
      // Color — warm/cool mix
      float temp=H(cell*400.);
      vec3 starCol=mix(vec3(0.6,0.7,1.),vec3(1.,0.85,0.6),temp);
      starCol=mix(starCol,vec3(1.),h*0.5);
      
      col+=starCol*alpha*0.8;
    }
  }
  
  // Shooting star (occasional)
  float st=mod(t*0.3,20.);
  float shoot=exp(-abs(length(uv-vec2(st*0.1-0.5,sin(st)*0.3))-st*0.02)*80.);
  shoot*=step(0.,st)*step(st,15.);
  col+=vec3(1.,0.95,0.8)*shoot*0.6;
  
  // Vignette
  col*=1.-length(uv)*0.3;
  
  ${isGL2 ? 'O' : 'gl_FragColor'}=vec4(col,1);
}`);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { console.warn('shader failed'); return; }

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
