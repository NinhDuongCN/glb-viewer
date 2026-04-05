// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('viewer'), antialias: true });
renderer.setSize(document.getElementById('viewer-container').clientWidth, document.getElementById('viewer-container').clientHeight);
renderer.setClearColor(0xffffff, 1); // Match light mode background
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Position camera
camera.position.z = 5;

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 50;

// Load GLB file
const loader = new THREE.GLTFLoader();
let model;

// Load default model
loadModel('6.1.glb');

function loadModel(url) {
    loader.load(
        url,
        function(gltf) {
            if (model) {
                scene.remove(model);
            }
            model = gltf.scene;
            scene.add(model);
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            // Adjust camera to fit model
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2;
            controls.update();
        },
        undefined,
        function(error) {
            console.error('An error happened', error);
        }
    );
}

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        loadModel(url);
    }
});

// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';
    // Update renderer background to match theme
    if (document.body.classList.contains('dark')) {
        renderer.setClearColor(0x1a1a1a, 1);
    } else {
        renderer.setClearColor(0xffffff, 1);
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', function() {
    const container = document.getElementById('viewer-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});