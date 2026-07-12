gsap.registerPlugin(ScrollTrigger);

// 1. Configuração Three.js
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Geometria Complexa (Wireframe TorusKnot)
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

camera.position.z = 30;

// Loop de Renderização
function animate() {
    requestAnimationFrame(animate);
    torusKnot.rotation.x += 0.001;
    torusKnot.rotation.y += 0.002;
    renderer.render(scene, camera);
}
animate();

// 2. Eventos de Redimensionamento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 3. Efeitos de Parallax com GSAP
// Rotação do objeto 3D baseada no scroll
gsap.to(torusKnot.rotation, {
    y: Math.PI * 2,
    x: Math.PI,
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// Fade e Slide nos textos e cards
gsap.utils.toArray('.parallax-text').forEach(text => {
    gsap.from(text, {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: text,
            start: "top 85%",
        }
    });
});

gsap.utils.toArray('.parallax-card').forEach((card, i) => {
    gsap.from(card, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        scrollTrigger: {
            trigger: card,
            start: "top 90%",
        }
    });
});