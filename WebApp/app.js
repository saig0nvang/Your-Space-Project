import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SEGMENTATION_API_BASE = 'http://127.0.0.1:7861';

let camera, scene, renderer;
let currentRootModel = null;
let aiRoomMesh = null;

const canvasContainer = document.getElementById('canvas-container');
const objectUI = document.getElementById('object-ui');
const rotationSlider = document.getElementById('rotation-slider');
const rotationVal = document.getElementById('rotation-val');
const aiLoading = document.getElementById('ai-loading');

const segmentationToggle = document.getElementById('segmentation-toggle');
const segmentationExport = document.getElementById('segmentation-export');
const segmentationStatus = document.getElementById('segmentation-status');
const segmentationStage = document.getElementById('segmentation-stage');
const segmentationFrame = document.getElementById('segmentation-frame');
const segmentationImage = document.getElementById('segmentation-image');
const segmentationOverlay = document.getElementById('segmentation-overlay');
const segmentationMarker = document.getElementById('segmentation-marker');

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragOffset = new THREE.Vector3();

let isDragging = false;
let segmentationState = {
    enabled: false,
    imageDataUrl: null,
    lastResult: null,
    lastTap: null,
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2b2b2b);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    setupLights();
    setupGroundPlane();
    setupFloorDragging();
    setupSegmentationUi();

    window.addEventListener('resize', onWindowResize);
    animate();
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
}

function setupGroundPlane() {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.ShadowMaterial({ opacity: 0.4 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);
}

function setupFloorDragging() {
    renderer.domElement.addEventListener('pointerdown', (event) => {
        if (!currentRootModel || segmentationState.enabled) return;

        updatePointerFromEvent(event);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([currentRootModel], true);
        if (intersects.length === 0) return;

        isDragging = true;
        objectUI.classList.remove('hidden');
        const deg = Math.round(THREE.MathUtils.radToDeg(currentRootModel.rotation.y));
        rotationSlider.value = deg;
        rotationVal.innerText = `${deg} deg`;

        floorPlane.constant = -currentRootModel.position.y;
        if (aiRoomMesh) {
            const roomHits = raycaster.intersectObject(aiRoomMesh);
            if (roomHits.length > 0) {
                dragOffset.copy(roomHits[0].point).sub(currentRootModel.position);
            }
        } else {
            const intersection = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(floorPlane, intersection)) {
                dragOffset.copy(intersection).sub(currentRootModel.position);
            }
        }
    });

    renderer.domElement.addEventListener('pointermove', (event) => {
        if (!isDragging || !currentRootModel) return;

        updatePointerFromEvent(event);
        raycaster.setFromCamera(mouse, camera);

        if (aiRoomMesh) {
            const roomHits = raycaster.intersectObject(aiRoomMesh);
            if (roomHits.length > 0) {
                const hitPoint = roomHits[0].point;
                currentRootModel.position.copy(hitPoint.clone().sub(dragOffset));
                if (currentRootModel.position.y < currentRootModel.userData.floorY) {
                    currentRootModel.position.y = currentRootModel.userData.floorY;
                }
            }
        } else {
            const intersection = new THREE.Vector3();
            if (raycaster.ray.intersectPlane(floorPlane, intersection)) {
                currentRootModel.position.copy(intersection.sub(dragOffset));
                currentRootModel.position.y = currentRootModel.userData.floorY;
            }
        }

        clampCurrentModelPosition();
    });

    renderer.domElement.addEventListener('pointerup', () => {
        isDragging = false;
    });
}

function updatePointerFromEvent(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function clampCurrentModelPosition() {
    const limitX = 8;
    const backZ = -10;
    const frontZ = 4;
    currentRootModel.position.z = Math.max(backZ, Math.min(frontZ, currentRootModel.position.z));
    currentRootModel.position.x = Math.max(-limitX, Math.min(limitX, currentRootModel.position.x));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.getElementById('bg-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    prepareSegmentationImage(file);
    aiLoading.classList.remove('hidden');

    setTimeout(() => {
        const colorImageUrl = URL.createObjectURL(file);
        const depthMapUrl = generateMockDepthMap();
        scene.background = new THREE.Color(0x000000);
        build3DDisplacementRoom(colorImageUrl, depthMapUrl);
    }, 500);
});

function prepareSegmentationImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
        segmentationState = {
            enabled: false,
            imageDataUrl: reader.result,
            lastResult: null,
            lastTap: null,
        };
        segmentationImage.src = reader.result;
        segmentationOverlay.classList.add('hidden');
        segmentationMarker.classList.add('hidden');
        segmentationToggle.disabled = false;
        segmentationExport.disabled = true;
        segmentationToggle.classList.remove('active');
        segmentationStage.classList.add('hidden');
        setSegmentationStatus('Anh da san sang. Bat segmentation va tap vao object can xoa.');
    };
    reader.readAsDataURL(file);
}

function generateMockDepthMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.45;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 350);
    gradient.addColorStop(0, 'rgb(20, 20, 20)');
    gradient.addColorStop(0.4, 'rgb(150, 150, 150)');
    gradient.addColorStop(1, 'rgb(255, 255, 255)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

function build3DDisplacementRoom(colorImgUrl, depthImgUrl) {
    const textureLoader = new THREE.TextureLoader();
    const colorTex = textureLoader.load(colorImgUrl);
    colorTex.colorSpace = THREE.SRGBColorSpace;

    textureLoader.load(depthImgUrl, (depthTex) => {
        const geo = new THREE.PlaneGeometry(50, 50, 128, 128);
        const mat = new THREE.MeshStandardMaterial({
            map: colorTex,
            displacementMap: depthTex,
            displacementScale: 20.0,
            side: THREE.DoubleSide,
            roughness: 1,
        });

        if (aiRoomMesh) scene.remove(aiRoomMesh);
        aiRoomMesh = new THREE.Mesh(geo, mat);
        aiRoomMesh.position.set(0, 0, -15);
        scene.add(aiRoomMesh);
        aiLoading.classList.add('hidden');
    });
}

function loadModel(filename) {
    if (currentRootModel) {
        scene.remove(currentRootModel);
        objectUI.classList.add('hidden');
    }

    const loader = new GLTFLoader();
    loader.load(
        filename,
        (gltf) => {
            const rawModel = gltf.scene;
            rawModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });

            const box = new THREE.Box3().setFromObject(rawModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const proxyGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
            const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
            currentRootModel = new THREE.Mesh(proxyGeo, proxyMat);
            currentRootModel.userData.floorY = size.y / 2;
            currentRootModel.position.set(0, currentRootModel.userData.floorY, -1);

            currentRootModel.add(rawModel);
            rawModel.position.set(-center.x, -center.y, -center.z);
            scene.add(currentRootModel);

            currentRootModel.rotation.y = THREE.MathUtils.degToRad(-30);
            objectUI.classList.remove('hidden');
            rotationSlider.value = -30;
            rotationVal.innerText = '-30 deg';
        },
        undefined,
        (error) => console.error(error),
    );
}

rotationSlider.addEventListener('input', (event) => {
    if (!currentRootModel) return;
    const rad = THREE.MathUtils.degToRad(event.target.value);
    currentRootModel.rotation.y = rad;
    rotationVal.innerText = `${event.target.value} deg`;
});

document.querySelectorAll('.asset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        loadModel(`./${btn.getAttribute('data-model')}`);
    });
});

function setupSegmentationUi() {
    segmentationToggle.addEventListener('click', () => {
        if (!segmentationState.imageDataUrl) {
            setSegmentationStatus('Hay upload anh phong truoc.', true);
            return;
        }
        setSegmentationMode(!segmentationState.enabled);
    });

    segmentationFrame.addEventListener('click', async (event) => {
        if (!segmentationState.enabled || !segmentationState.imageDataUrl) return;
        await requestSegmentation(event);
    });

    segmentationExport.addEventListener('click', exportSegmentationResult);
}

function setSegmentationMode(enabled) {
    segmentationState.enabled = enabled;
    segmentationToggle.classList.toggle('active', enabled);
    segmentationStage.classList.toggle('hidden', !enabled);
    objectUI.classList.add('hidden');

    if (enabled) {
        setSegmentationStatus('Tap vao object/furniture trong anh de tao mask.');
    } else {
        setSegmentationStatus('Segmentation tam tat. Bat lai de tap object khac.');
    }
}

async function requestSegmentation(event) {
    const point = getImagePixelFromClick(event);
    if (!point) return;

    setTapMarker(event);
    setSegmentationStatus(`Dang goi SAM2 tai (${point.x}, ${point.y})...`);
    segmentationExport.disabled = true;

    try {
        const response = await fetch(`${SEGMENTATION_API_BASE}/api/v1/segment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: segmentationState.imageDataUrl,
                x: point.x,
                y: point.y,
                label: 1,
            }),
        });

        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.detail || 'SAM2 service error');
        }

        segmentationState.lastResult = payload;
        segmentationState.lastTap = point;
        segmentationOverlay.src = `data:image/png;base64,${payload.overlay_png_base64}`;
        segmentationOverlay.classList.remove('hidden');
        segmentationExport.disabled = false;
        setSegmentationStatus(`Mask san sang. Score ${payload.score.toFixed(3)}. Co the export cho Inpainting.`);
    } catch (error) {
        setSegmentationStatus(`Khong tao duoc mask: ${error.message}`, true);
    }
}

function getImagePixelFromClick(event) {
    const rect = segmentationImage.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    if (relativeX < 0 || relativeY < 0 || relativeX > rect.width || relativeY > rect.height) {
        return null;
    }

    const x = Math.round((relativeX / rect.width) * segmentationImage.naturalWidth);
    const y = Math.round((relativeY / rect.height) * segmentationImage.naturalHeight);
    return {
        x: Math.max(0, Math.min(segmentationImage.naturalWidth - 1, x)),
        y: Math.max(0, Math.min(segmentationImage.naturalHeight - 1, y)),
    };
}

function setTapMarker(event) {
    const frameRect = segmentationFrame.getBoundingClientRect();
    segmentationMarker.style.left = `${event.clientX - frameRect.left}px`;
    segmentationMarker.style.top = `${event.clientY - frameRect.top}px`;
    segmentationMarker.classList.remove('hidden');
}

async function exportSegmentationResult() {
    if (!segmentationState.lastResult) return;

    const metadata = {
        source: 'YourSpace SAM2 segmentation MVP',
        tap: segmentationState.lastTap,
        bbox: segmentationState.lastResult.bbox,
        score: segmentationState.lastResult.score,
        image_size: segmentationState.lastResult.image_size,
        model: segmentationState.lastResult.model,
        exported_at: new Date().toISOString(),
    };

    setSegmentationStatus('Dang export image + mask vao Segmentation/outputs...');
    segmentationExport.disabled = true;

    try {
        const response = await fetch(`${SEGMENTATION_API_BASE}/api/v1/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: segmentationState.imageDataUrl,
                mask: segmentationState.lastResult.mask_png_base64,
                overlay: segmentationState.lastResult.overlay_png_base64,
                metadata,
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.detail || 'Export failed');
        }
        setSegmentationStatus(`Da export: ${payload.folder}`);
    } catch (error) {
        setSegmentationStatus(`Khong export duoc: ${error.message}`, true);
    } finally {
        segmentationExport.disabled = false;
    }
}

function setSegmentationStatus(message, isError = false) {
    segmentationStatus.textContent = message;
    segmentationStatus.classList.toggle('error', isError);
}

init();
