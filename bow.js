/* =========================================
   SEEWI — Three.js bow viewer (GLB)
   Loads images/활_다시glb.glb via GLTFLoader
   ========================================= */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('bowCanvas');
const loaderEl  = document.getElementById('bowLoader');
const pctEl     = document.getElementById('bowPct');

const log    = (...a) => console.log('[SEEWI bow]', ...a);
const logErr = (...a) => console.error('[SEEWI bow]', ...a);

const setLoaderText = (html) => {
  const t = loaderEl?.querySelector('.bow-loader__text');
  if (t) t.innerHTML = html;
};

if (container) {
  /* ---- scene ---- */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50000);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  /* ---- lights ---- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdedede, 0.75));

  const key  = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rim  = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffffff, 0.30);
  fill.position.set(0, -3, 2);
  scene.add(fill);

  /* ---- controls ---- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.85;
  controls.panSpeed = 0.7;

  /* zoom — mouse wheel + trackpad pinch (macOS trackpad pinch
     fires wheel events with ctrlKey, handled identically by OrbitControls) */
  controls.enableZoom = true;
  controls.zoomSpeed  = 1.2;
  controls.zoomToCursor = true;   // zoom toward the cursor position
  controls.screenSpacePanning = true;

  /* ---- resize ---- */
  const resize = () => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  };
  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(container);
  }

  /* ---- render loop ---- */
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  /* ---- colour state (driven by bottom-bar swatches) ---- */
  const meshes = [];
  let pendingColor = null;

  const applyColor = (hex) => {
    meshes.forEach((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => {
        if (mat && mat.color) mat.color.setHex(hex);
      });
    });
  };

  document.addEventListener('seewi:bow-color', (e) => {
    const hex = e.detail?.color;
    if (typeof hex !== 'number') return;
    if (meshes.length === 0) {
      pendingColor = hex;       // model not loaded yet — remember
    } else {
      applyColor(hex);
    }
  });

  /* ---- load GLB ---- */
  const url = 'images/' + encodeURIComponent('활_다시glb.glb');
  log('Fetching', url);

  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    url,
    (gltf) => {
      const obj = gltf.scene || gltf.scenes?.[0];
      if (!obj) {
        setLoaderText('No scene in GLB.');
        return;
      }
      log('Parsed GLB:', gltf);

      /* keep existing materials from GLB; just tune them slightly to match palette */
      let meshCount = 0;
      obj.traverse((c) => {
        if (c.isMesh) {
          meshCount++;
          if (c.material) {
            c.material.side = THREE.DoubleSide;
            if ('roughness' in c.material) c.material.roughness = Math.min(1, c.material.roughness ?? 0.6);
            if ('metalness' in c.material) c.material.metalness = Math.min(1, c.material.metalness ?? 0.1);
          }
          if (c.geometry && !c.geometry.attributes.normal) {
            c.geometry.computeVertexNormals();
          }
          meshes.push(c);
        }
      });
      log(`Mesh count: ${meshCount}`);
      if (meshCount === 0) {
        setLoaderText('No mesh in GLB.');
        return;
      }

      /* apply any swatch picked while the model was still loading */
      if (pendingColor !== null) {
        applyColor(pendingColor);
        pendingColor = null;
      }

      /* centre */
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      log('Bounding size:', size.toArray(), 'centre:', centre.toArray());
      obj.position.sub(centre);
      obj.rotation.set(0, Math.PI * 0.05, 0);
      scene.add(obj);

      /* fit camera */
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      log('Bounding sphere radius:', sphere.radius);

      const fov = camera.fov * (Math.PI / 180);
      const dist = (sphere.radius / Math.sin(fov / 2)) * 1.1;
      camera.position.set(0, 0, dist);
      camera.near = Math.max(0.01, dist / 500);
      camera.far  = dist * 50;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.minDistance = sphere.radius * 0.2;
      controls.maxDistance = dist * 10;
      controls.update();

      /* fade loader out */
      if (loaderEl) {
        loaderEl.classList.add('is-hidden');
        setTimeout(() => loaderEl.remove(), 800);
      }
      log('Done.');
    },
    (xhr) => {
      if (xhr.lengthComputable && pctEl) {
        pctEl.textContent = `${Math.round((xhr.loaded / xhr.total) * 100)}%`;
      }
    },
    (err) => {
      logErr('GLB load failed:', err);
      setLoaderText('Failed to load model. See console.');
    }
  );
}
