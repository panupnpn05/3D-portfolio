import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

// Camera
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('webgl'),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 10, 5);
scene.add(dirLight);

// --- Load scene.glb ---
const loader = new GLTFLoader();

loader.load('/models/room.glb', (gltf) => {
  scene.add(gltf.scene);
}, undefined, (err) => {
  console.error('❌ Failed to load GLB:', err);
});

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
