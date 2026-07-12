gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
let scrollProg = 0;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

if (!prefersReduced && typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg-canvas'), alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;
const clock = new THREE.Clock();

const bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: {
            uTime: { value: 0 }, uScroll: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
        fragmentShader: `
            uniform float uTime,uScroll; uniform vec2 uMouse,uRes; varying vec2 vUv;
            float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
            void main(){
                vec2 uv=vUv; float a=uRes.x/uRes.y; uv.x*=a;
                float g=40.0; vec2 grid=fract(uv*g)-0.5; float d=length(grid);
                float w=sin(uv.x*8.0+uTime*0.5+uScroll*3.0)*0.3+sin(uv.y*6.0+uTime*0.4)*0.2+hash(floor(uv*g))*0.15;
                float m=smoothstep(0.3,0.0,length(uv-uMouse*vec2(a,1.0)))*0.4;
                float s=0.15+w*0.1+m; float al=smoothstep(s,s-0.05,d)*(0.15+w*0.1+m*0.3);
                gl_FragColor=vec4(vec3(1.0),al);
            }
        `,
    })
);
scene.add(bgMesh);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    bgMesh.material.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
});
if (!isTouch) window.addEventListener('mousemove', (e) => {
    mouse.tx = e.clientX / window.innerWidth * 2 - 1;
    mouse.ty = -(e.clientY / window.innerHeight * 2 - 1);
});

if (!prefersReduced) (function loop() {
    requestAnimationFrame(loop);
    const u = bgMesh.material.uniforms;
    u.uTime.value = clock.getElapsedTime();
    u.uScroll.value = scrollProg;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    u.uMouse.value.set(mouse.x, mouse.y);
    renderer.render(scene, camera);
})();

if (!isTouch) {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursor-dot');
    let cx = 0, cy = 0, mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function cl() {
        cx += (mx - cx) * 0.15; cy += (my - cy) * 0.15;
        cursor.style.transform = `translate(${cx}px,${cy}px)`;
        requestAnimationFrame(cl);
    })();
    document.querySelectorAll('a, [data-magnetic]').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
}

if (!isTouch && !prefersReduced) document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.15, y: (e.clientY - r.top - r.height / 2) * 0.15, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }));
});

document.querySelectorAll('.hero__title .word').forEach((word) => {
    word.innerHTML = [...word.textContent].map((c) => `<span class="char">${c}</span>`).join('');
});

function initScrollAnimations() {
    const bar = document.getElementById('progress-bar');
    ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (s) => { scrollProg = s.progress; gsap.set(bar, { scaleX: scrollProg }); },
    });
    const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__title', { scale: 1.8, opacity: 0, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero__title .char', { yPercent: -30, ease: 'none', stagger: 0.02, scrollTrigger: heroST });
    gsap.to('.hero__tag', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero__meta', { yPercent: -100, opacity: 0, ease: 'none', scrollTrigger: heroST });
    gsap.utils.toArray('.section__head').forEach((head) => {
        gsap.from(head.querySelector('.section__title'), { yPercent: 100, duration: 0.9, ease: 'power4.out', scrollTrigger: { trigger: head, start: 'top 85%' } });
        gsap.from(head.querySelector('.section__index'), { opacity: 0, x: -12, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: head, start: 'top 85%' } });
    });
    gsap.utils.toArray('.pcard').forEach((card) => {
        gsap.fromTo(card, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' } });
        gsap.fromTo(card.querySelectorAll('.pcard__head, .pcard__name, .pcard__desc, .pcard__link'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' } });
    });
    gsap.from('.footer__row', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    ScrollTrigger.refresh();
}

const plCount = document.getElementById('pl-count');
const plBar = document.getElementById('pl-bar');

if (prefersReduced) {
    gsap.set('#preloader', { display: 'none' });
    document.body.classList.remove('is-loading');
    initScrollAnimations();
} else {
    gsap.set('.hero__meta', { opacity: 0, y: 20 });
    gsap.set('.hero__title .char', { yPercent: 115 });
    gsap.set('.hero__tag', { opacity: 0, y: 20 });
    const c = { v: 0 };
    gsap.timeline({ onComplete: () => { document.body.classList.remove('is-loading'); initScrollAnimations(); } })
        .to(c, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate: () => { plCount.textContent = Math.round(c.v); } }, 0)
        .to(plBar, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
        .to('.preloader__top, .preloader__count, .preloader__bar', { yPercent: -100, opacity: 0, duration: 0.7, ease: 'power3.in', stagger: 0.05 }, '+=0.1')
        .to('#preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '-=0.3')
        .to('.hero__meta', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .to('.hero__title .char', { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.03 }, '-=0.5')
        .to('.hero__tag', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
}
