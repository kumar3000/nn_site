// NOT Gate Perceptron - 3D Visualization
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let scene, camera, renderer, controls;
let cssScene, cssRenderer;
let inputNode, outputNode, connectionLine;
let subsectionNodes = [];
let subsectionLines = [];
let subsectionLabels = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let floatingControls, controls3DObject;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D scene
    init3DScene();
    
    // Get DOM elements
    const input1Slider = document.getElementById('input1Slider');
    const input1ValueDisplay = document.getElementById('input1Value');
    
    // Fixed weights and bias for NOT gate
    const w1 = -10.0;
    const bias = 5.0;
    
    // Get floating controls element (already created in 3D scene)
    floatingControls = document.getElementById('floatingControls');
    
    // Step function (Heaviside step function) for real NOT gate behavior
    function step(x) {
        return x >= 0 ? 1 : 0;
    }
    
    // Calculate NOT gate output
    function calculateNOTGate() {
        // Get input value
        const x1 = parseFloat(input1Slider.value);
        
        // Calculate weighted sum (using fixed weight and bias)
        const weightedSum = (x1 * w1) + bias;
        
        // Apply step function
        const output = step(weightedSum);
        
        // Update display
        input1ValueDisplay.textContent = x1.toFixed(2);
        
        // Update 3D node opacities and colors
        update3DNodes(x1, output);
    }
    
    // Add event listener
    input1Slider.addEventListener('input', calculateNOTGate);
    
    // Initialize
    calculateNOTGate();
    animate();
});

function init3DScene() {
    const container = document.getElementById('canvas-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // CSS3D Scene (for HTML elements in 3D)
    cssScene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 5);
    
    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // CSS3D Renderer
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.zIndex = '100';
    container.appendChild(cssRenderer.domElement);
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00ff41, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Create input node (left)
    const inputGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const inputMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 0.3
    });
    inputNode = new THREE.Mesh(inputGeometry, inputMaterial);
    inputNode.position.set(-2, 0, 0);
    scene.add(inputNode);
    
    // Add label for input node
    addLabel(inputNode, 'Input (x₁)', new THREE.Vector3(0, -0.8, 0));
    
    // Create 3D controls panel above input node
    floatingControls = document.getElementById('floatingControls');
    if (floatingControls) {
        // Show the wrapper
        const wrapper = document.getElementById('controls-3d-wrapper');
        if (wrapper) wrapper.style.display = 'block';
        
        // Create CSS3D object from the controls element
        controls3DObject = new CSS3DObject(floatingControls);
        controls3DObject.scale.set(0.01, 0.01, 0.01); // Scale down for 3D space
        controls3DObject.position.set(-2, 1.2, 0); // Position above input node
        cssScene.add(controls3DObject);
    }
    
    // Create output node (right)
    const outputGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const outputMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 0.3
    });
    outputNode = new THREE.Mesh(outputGeometry, outputMaterial);
    outputNode.position.set(2, 0, 0);
    scene.add(outputNode);
    
    // Add label for output node
    addLabel(outputNode, 'Output', new THREE.Vector3(0, -0.9, 0));
    
    // Create connection line
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff41,
        transparent: true,
        opacity: 0.5
    });
    connectionLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(connectionLine);
    
    // Create 3 subsection nodes adjacent to output node
    createSubsectionNodes();
    
    // Add click handler for subsection nodes
    renderer.domElement.addEventListener('click', onNodeClick);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function addLabel(mesh, text, offset) {
    // Create a simple text sprite (using canvas for text)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#00ff41';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);
    sprite.position.copy(mesh.position).add(offset);
    scene.add(sprite);
    return sprite;
}

function createSubsectionNodes() {
    const subsectionPositions = [
        { pos: new THREE.Vector3(3.5, 1.5, 0), label: 'Section 1', url: 'section1.html' },
        { pos: new THREE.Vector3(3.5, 0, 0), label: 'Section 2', url: 'section2.html' },
        { pos: new THREE.Vector3(3.5, -1.5, 0), label: 'Section 3', url: 'section3.html' }
    ];
    
    subsectionPositions.forEach((config, index) => {
        // Create node
        const geometry = new THREE.SphereGeometry(0.4, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff41,
            emissive: 0x00ff41,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.2
        });
        const node = new THREE.Mesh(geometry, material);
        node.position.copy(config.pos);
        node.userData = { url: config.url, label: config.label, index: index, activated: false };
        scene.add(node);
        subsectionNodes.push(node);
        
        // Add label (initially hidden)
        const label = addLabel(node, config.label, new THREE.Vector3(0, -0.7, 0));
        label.visible = false;
        subsectionLabels.push(label);
        
        // Create connection line from output to subsection node
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        subsectionLines.push(line);
    });
}

function update3DNodes(inputOpacity, outputOpacity) {
    // Update input node opacity
    inputNode.material.opacity = inputOpacity;
    inputNode.material.transparent = true;
    inputNode.material.emissiveIntensity = inputOpacity * 0.5;
    
    // Update output node opacity
    outputNode.material.opacity = outputOpacity;
    outputNode.material.transparent = true;
    outputNode.material.emissiveIntensity = outputOpacity * 0.5;
    
    // Update connection line
    const points = [
        new THREE.Vector3(inputNode.position.x, inputNode.position.y, inputNode.position.z),
        new THREE.Vector3(outputNode.position.x, outputNode.position.y, outputNode.position.z)
    ];
    connectionLine.geometry.setFromPoints(points);
    connectionLine.material.opacity = Math.min(inputOpacity, outputOpacity) * 0.5;
    
    // Update subsection nodes - they activate when output is active
    subsectionNodes.forEach((node, index) => {
        const isActivated = outputOpacity > 0;
        node.userData.activated = isActivated;
        
        node.material.opacity = outputOpacity;
        node.material.emissiveIntensity = outputOpacity * 0.4;
        
        // Show/hide label based on activation
        if (subsectionLabels[index]) {
            subsectionLabels[index].visible = isActivated;
        }
        
        // Update connection lines from output to subsection nodes
        const linePoints = [
            new THREE.Vector3(outputNode.position.x, outputNode.position.y, outputNode.position.z),
            new THREE.Vector3(node.position.x, node.position.y, node.position.z)
        ];
        subsectionLines[index].geometry.setFromPoints(linePoints);
        subsectionLines[index].material.opacity = outputOpacity * 0.3;
    });
}

function onNodeClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster with camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections with subsection nodes
    const intersects = raycaster.intersectObjects(subsectionNodes);
    
    if (intersects.length > 0) {
        const clickedNode = intersects[0].object;
        // Only navigate if node is activated
        if (clickedNode.userData.url && clickedNode.userData.activated) {
            // Navigate to subsection page
            window.location.href = clickedNode.userData.url;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
    updateFloatingControlsPosition();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function updateFloatingControlsPosition() {
    if (!controls3DObject || !inputNode) return;
    
    // Update 3D position to hover above input node
    const inputPos = inputNode.position.clone();
    controls3DObject.position.set(inputPos.x, inputPos.y + 1.2, inputPos.z);
    
    // Make panel face camera (billboard effect)
    controls3DObject.lookAt(camera.position);
}
