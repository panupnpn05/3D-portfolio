import * as THREE from 'three';
import gsap from 'gsap';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { fog } from 'three/src/nodes/TSL.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('#131313');

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,    // near
  5000     // far (increase as needed)
);
camera.position.set(4, 1,0)
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('webgl'),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// const floorGeometry = new THREE.PlaneGeometry(100, 100); // width, height
// const floorMaterial = new THREE.MeshStandardMaterial({
//   color: '',
//   roughness: 0,
// });
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// // Rotate it flat and position it
// floor.rotation.x = -Math.PI / 2; // Rotate 90 degrees to lie flat
// floor.position.y = -0.5; // Place just under the model
// floor.receiveShadow = true; // Receive shadows

// scene.add(floor);

const fontLoader = new FontLoader();

let textMesh; // Declare textMesh in a wider scope

fontLoader.load('/helvetiker_regular.typeface.json', (font) => {
  const textGeometry = new TextGeometry('Aston Martin', {
    font: font,
    size: 2.2,
    height: 0.5, // reduce depth to make it more realistic
    depth: 0.1, // thinner depth
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.01,
    bevelSegments: 3,
  });

  const textMaterial = new THREE.MeshStandardMaterial({
    color: '#037A68',   // greenish base color
    metalness: 0.6,     // max metallic shine
    roughness: 0.3,     // low roughness = shinier
    envMapIntensity: 0, // enhances reflection if envMap is used
  });

  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();

  textMesh.position.set(-2, 0.5, 0);
  textMesh.rotation.set(0, Math.PI / 2, 0); // face camera
  textMesh.castShadow = true;

  scene.add(textMesh);
});

// Lighting
let dirLight
// Create directional light
dirLight = new THREE.DirectionalLight(0xffffff, 8);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Add ambient light
scene.add(ambientLight); // Add ambient light to the scene

// Position it behind the text on positive Z (toward camera is negative Z)
dirLight.position.set(0.3, 0, 0);  // same x,y as text, z positive behind text


// Make it point to the text position
dirLight.target.position.set(1, 0, 0);
scene.add(dirLight.target);  // important!

dirLight.castShadow = true;

// Optional shadow settings
dirLight.shadow.mapSize.width = 1024; // increase shadow resolution
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.radius = 4;

scene.add(dirLight);

let model;

scene.background = new THREE.Color(0x000000);

// Add stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
const starVertices = [];

for (let i = 0; i < 10000; i++) {
  const x = THREE.MathUtils.randFloatSpread(200);
  const y = THREE.MathUtils.randFloatSpread(200);
  const z = THREE.MathUtils.randFloatSpread(200);
  starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); //
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);


// --- Load scene.glb ---
const loader = new GLTFLoader();

loader.load('/f1.glb', (glb) => {
  model = glb.scene;
  model.position.set(0, 0, 0);
  scene.add(model);
}, undefined, (err) => {
  console.error('❌ Failed to load GLB:', err);
});

// Rotate to front on button click
document.getElementById('rotateToFront').addEventListener('click', () => {
  if (!model) return;

  // Define the desired camera position for the front view
  const targetPosition = {
    x: 1,
    y: 1,
    z: 1.6, // Move behind the front
  };

  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 2.0,
    ease: 'power2.inOut',
    onUpdate: () => {
      camera.lookAt(model.position);
    }
  });

  gsap.to(model.position, {
    x: 0,
    y: 0,
  z:-1.5,
    duration: 2.0,
    ease: 'power2.inOut',
  });

 gsap.to(textMesh.rotation, {
  x: 0,
  y: 0.2,
  z: 0,
  duration: 2,
  ease: 'power2.inOut',
});
  gsap.to(textMesh.position, {
    x: -1.5,
    y: 1,
    z: -4,
    duration: 2.0,
    ease: 'power2.inOut',
  });

  gsap.to(dirLight.position, {
    x: 1,  
    y: 0.1,
    z: 1.5, // Move behind the front
    duration: 1.5,
    ease: 'power2.inOut',
  });

});

scene.fog = new THREE.FogExp2(0x222831, 0.02); // adds fog depth

// --- Scroll animation setup ---
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// --- Animation loop ---
function animate() {
  requestAnimationFrame(animate);

  const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);

  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
