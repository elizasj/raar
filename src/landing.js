import * as THREE from "three"
import glsl from "glslify"

/************************* **********************/

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true
})

renderer.setPixelRatio(window.devicePixelRatio)

const canvas = renderer.domElement
const width = window.innerWidth
const height = window.innerHeight

// There's no reason to set the aspect here because we're going
// to set it every frame any
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const scene = new THREE.Scene()
var geometry = new THREE.PlaneBufferGeometry(2, 2)

// Mouse tracking
const mouse = [0, 0]

// create a mouse listener
const move = ev => {
  mouse[0] = ev.clientX / window.innerWidth
  mouse[1] = (window.innerHeight - ev.clientY - 1) / window.innerHeight
}
window.addEventListener("mousemove", move)

// --------- shader code start

const frag = glsl(/* glsl */ `
  uniform float time;
  uniform vec2 mouse;

  varying vec2 vUv;

  float ltime;

  float noise(vec2 p)
  {
    return sin(p.x*4.) * sin(p.y*(3.7 + sin(ltime/11.))) + .2 * mouse.x; 
  }

  mat2 rotate(float angle)
  {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }


  float fbm(vec2 p)
  {
    p *= 1.1;
    float f = 0.;
    float amp = .5;
    for( int i = 0; i < 3; i++) {
      mat2 modify = rotate(ltime/50. * float(i*i));
      f += amp*noise(p);
      p = modify * p + (mouse.y * 0.1);
      p *= 2.;
      amp /= 8.2;
    }
    return f;
  }

  float pattern(vec2 p, out vec2 q, out vec2 r) {
    q = vec2( fbm(p + vec2(3.)),
        fbm(rotate(.01*ltime)*vUv + vec2(2.)));
    r = vec2( fbm(rotate(.2)*q + vec2(0.)),
        fbm(q + vec2(0.)));
    return fbm(p + 1.1+r);

  }

  vec3 hsv2rgb(vec3 c)
  {
      // flash -- vec4 K = vec4(1.0, 2.0 / sin(3.0), 1.0 / tan(3.0 / sin(time)), 3.0);
      vec4 K = vec4(1.0, 2.0 , 1.0, 3.0);
      // vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx / K.yyy) * 3.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxz, 4.0, 1.0), p.x);
  }


  void main() {
    ltime = time;
    float ctime = time + fbm(vUv/8.)*20.;
    float ftime = fract(ctime/6.);
    ltime = floor(ctime/6.) + (1.-cos(ftime*3.1415)/2.);
    ltime = ltime*6.;

    vec2 q;
    vec2 r;
    float f = pattern(vUv, q, r);
    vec3 col = hsv2rgb(vec3(q.x/10. + ltime/100. + .4, abs(r.y)*3. + .1, r.x + f));
    float vig = 1. - pow(4.*(vUv.x - .5)*(vUv.x - .5), 10.);
    // vig *= 1. - pow(15.*(vUv.y - .5)*(vUv.y - .5), 40.);
    vig *= 1. - pow(15.*(vUv.y - .5)*(vUv.y - .5), 10.);

    gl_FragColor = vec4(col*vig,1.);
} 
`)

const vert = glsl(/* glsl */ `
  varying vec2 vUv; // bridge between
  uniform float time;

  void main() { 
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`)

// --------- shader code end

// backgrougnd material
const material = new THREE.ShaderMaterial({
  fragmentShader: frag,
  vertexShader: vert,
  uniforms: {
    aspect: { value: width / height },
    time: { value: 0 },
    mouse: mouse
  }
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Handle resize events here
function resizeCanvasToDisplaySize() {
  const width = window.innerWidth
  const height = window.innerHeight
  const pixelRatio = window.devicePixelRatio

  const size = renderer.getSize()
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
}

window.ondragstart = () => false

// Avoid iOS drag events
document.addEventListener("touchmove", ev => ev.preventDefault(), {
  passive: false
})

function animate(time) {
  time *= 0.001 // seconds

  resizeCanvasToDisplaySize()

  mesh.material.uniforms.time.value = time
  mesh.material.uniforms.mouse.value = mouse

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

resizeCanvasToDisplaySize(true)
requestAnimationFrame(animate)
