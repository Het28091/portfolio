'use strict';

/* ══════════════════════════════════════════════════
   EMAILJS — init (replace with your actual public key)
   Sign up free at: https://www.emailjs.com
   Service ID: YOUR_SERVICE_ID  Template ID: YOUR_TEMPLATE_ID
══════════════════════════════════════════════════ */
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: 'YOUR_PUBLIC_KEY_HERE' });
    }
})();

/* ══════════════════════════════════════════════════
   PDF.js CERTIFICATE RENDERER
   Renders the first page of each cert PDF onto a canvas
   Works on GitHub Pages, AWS S3, Netlify — any host
══════════════════════════════════════════════════ */
(function initPDFViewer() {
    if (typeof pdfjsLib === 'undefined') return;
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const DPR = Math.min(window.devicePixelRatio || 1, 2); // max 2× for HD

    function renderPDF(canvas) {
        const pdfUrl = canvas.dataset.pdf;
        if (!pdfUrl || canvas.dataset.loaded) return;
        canvas.dataset.loaded = '1';
        canvas.style.opacity = '0';

        pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
            pdf.getPage(1).then(page => {
                const parent = canvas.closest('.cert-flip-back');
                // Scale to CARD HEIGHT — makes all certs same card size
                const displayH = parent ? parent.clientHeight : 210;
                const displayW = parent ? parent.clientWidth : 200;
                const unscaledVp = page.getViewport({ scale: 1 });
                // Fill height, let width clip naturally
                const scaleH = (displayH / unscaledVp.height) * DPR;
                const scaleW = (displayW / unscaledVp.width) * DPR;
                const scale = Math.max(scaleH, scaleW); // cover, not letterbox
                const viewport = page.getViewport({ scale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                // CSS: let overflow:hidden on parent clip excess
                canvas.style.width = (viewport.width / DPR) + 'px';
                canvas.style.height = (viewport.height / DPR) + 'px';

                page.render({
                    canvasContext: canvas.getContext('2d'),
                    viewport,
                }).promise.then(() => {
                    canvas.style.transition = 'opacity 0.4s ease';
                    canvas.style.opacity = '1';
                });
            });
        }).catch(() => {
            canvas.style.opacity = '0.4';
        });
    }

    // Observe each cert-flip card — render its PDF when it enters viewport
    document.querySelectorAll('.pdf-canvas').forEach(canvas => {
        const card = canvas.closest('.cert-flip');
        if (!card) { renderPDF(canvas); return; }
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            renderPDF(canvas);
        }, { threshold: 0.05 });
        obs.observe(card);
    });
})();



/* ══════════════════════════════════════════════════
   SECURITY — disable right-click & text selection
══════════════════════════════════════════════════ */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

/* ══════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════ */
const cursorOuter = document.getElementById('cursorOuter');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, outerX = 0, outerY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
    outerX += (mouseX - outerX) * 0.12;
    outerY += (mouseY - outerY) * 0.12;
    cursorOuter.style.left = outerX + 'px';
    cursorOuter.style.top = outerY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a,button,.tilt-card,.tag,.cert-flip,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOuter.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hover'));
});

/* ══════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

/* ══════════════════════════════════════════════════
   BINARY RAIN — falling 0/1 on hero background
══════════════════════════════════════════════════ */
(function initBinaryRain() {
    const canvas = document.getElementById('binaryRain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const FONT_SIZE = 14;
    const SPEED = 0.18; // slow drift
    const ACCENT = 'rgba(255,0,60,';

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const cols = () => Math.floor(canvas.width / FONT_SIZE);
    let drops = Array.from({ length: cols() }, () => Math.random() * -canvas.height / FONT_SIZE);

    window.addEventListener('resize', () => {
        drops = Array.from({ length: cols() }, () => Math.random() * -canvas.height / FONT_SIZE);
    });

    function draw() {
        ctx.fillStyle = 'rgba(10,10,10,0.045)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = FONT_SIZE + 'px JetBrains Mono, monospace';
        const c = cols();
        for (let i = 0; i < c; i++) {
            const ch = Math.random() > 0.5 ? '1' : '0';
            const y = drops[i] * FONT_SIZE;
            const alpha = Math.max(0.04, Math.min(0.22, drops[i] / (canvas.height / FONT_SIZE) * 0.25));
            ctx.fillStyle = ACCENT + alpha + ')';
            ctx.fillText(ch, i * FONT_SIZE, y);
            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i] += SPEED;
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ══════════════════════════════════════════════════
   THREE.JS PARTICLE NETWORK
══════════════════════════════════════════════════ */
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 60 : 130;
    const CONNECT = isMobile ? 100 : 140;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 280;

    const positions = new Float32Array(COUNT * 3);
    const velocities = [];
    for (let i = 0; i < COUNT; i++) {
        const s = 220;
        positions[i * 3] = (Math.random() - 0.5) * s;
        positions[i * 3 + 1] = (Math.random() - 0.5) * s;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        velocities.push((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xff003c, size: 2.2, sizeAttenuation: true, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.18 });
    let linesMesh;

    function buildLines() {
        if (linesMesh) { scene.remove(linesMesh); linesMesh.geometry.dispose(); }
        const verts = [];
        const pos = geo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                if (Math.sqrt(dx * dx + dy * dy + dz * dz) < CONNECT) {
                    verts.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
                }
            }
        }
        const lg = new THREE.BufferGeometry();
        lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        linesMesh = new THREE.LineSegments(lg, lineMat);
        scene.add(linesMesh);
    }
    buildLines();

    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => { mx = (e.clientX / window.innerWidth - 0.5) * 40; my = (e.clientY / window.innerHeight - 0.5) * 40; });
    window.addEventListener('touchmove', e => { const t = e.touches[0]; mx = (t.clientX / window.innerWidth - 0.5) * 20; my = (t.clientY / window.innerHeight - 0.5) * 20; }, { passive: true });

    let frame = 0;
    function animate() {
        requestAnimationFrame(animate);
        const pos = geo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3] += velocities[i * 3];
            pos[i * 3 + 1] += velocities[i * 3 + 1];
            const b = 115;
            if (Math.abs(pos[i * 3]) > b) velocities[i * 3] *= -1;
            if (Math.abs(pos[i * 3 + 1]) > b) velocities[i * 3 + 1] *= -1;
        }
        geo.attributes.position.needsUpdate = true;
        if (++frame % 3 === 0) buildLines();
        camera.position.x += (mx - camera.position.x) * 0.025;
        camera.position.y += (-my - camera.position.y) * 0.025;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    });
})();

/* ══════════════════════════════════════════════════
   TYPING EFFECT
══════════════════════════════════════════════════ */
(function initTyping() {
    const phrases = [
        'Cybersecurity Enthusiast',
        'RHCSA Certified Engineer',
        'Penetration Testing Practitioner',
        'AWS Cloud Security Specialist',
        'Cryptography Engineer',
        'CTF Competitor — Global Rank 51',
    ];
    const el = document.getElementById('typingText');
    let pi = 0, ci = 0, deleting = false;

    function tick() {
        const phrase = phrases[pi];
        if (!deleting) {
            el.textContent = phrase.slice(0, ++ci);
            if (ci === phrase.length) { deleting = true; setTimeout(tick, 2000); return; }
        } else {
            el.textContent = phrase.slice(0, --ci);
            if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
        }
        setTimeout(tick, deleting ? 42 : 68);
    }
    tick();
})();

/* ══════════════════════════════════════════════════
   SCROLL REVEAL (DECRYPT EFFECT)
══════════════════════════════════════════════════ */
(function initReveal() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

    function scramble(el, original, duration) {
        const len = original.length;
        let iter = 0;
        const total = duration / 40;
        const iv = setInterval(() => {
            el.textContent = original.split('').map((ch, i) => {
                if (ch === ' ') return ' ';
                if (i < iter) return original[i];
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');
            iter += len / total;
            if (iter >= len) { el.textContent = original; clearInterval(iv); }
        }, 40);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add('revealed');
            if (['H2', 'H3', 'H4'].includes(el.tagName) && el.textContent.trim().length > 0 && !el.querySelector('*')) {
                scramble(el, el.textContent, 500);
            }
            el.querySelectorAll('.skill-bar-row').forEach(row => triggerBar(row));
            observer.unobserve(el);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-decrypt').forEach(el => observer.observe(el));

    function triggerBar(row) {
        const fill = row.querySelector('.bar-fill');
        if (fill) setTimeout(() => { fill.style.width = row.dataset.pct + '%'; }, 200);
    }
    document.querySelectorAll('.skill-bar-row').forEach(row => {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { triggerBar(row); obs.unobserve(row); }
        }, { threshold: 0.5 });
        obs.observe(row);
    });
})();

/* ══════════════════════════════════════════════════
   SKILLS TAG CLOUD — CSS 3D floating skill names
══════════════════════════════════════════════════ */
(function initTagCloud() {
    const wrapper = document.getElementById('skillsGlobe');
    if (!wrapper) return;

    const skillData = [
        { text: 'Linux / RHEL', pct: 90 },
        { text: 'Python', pct: 88 },
        { text: 'Cryptography', pct: 85 },
        { text: 'AWS Security', pct: 85 },
        { text: 'Shell / Bash', pct: 82 },
        { text: 'Network Sec', pct: 80 },
        { text: 'Pen Testing', pct: 78 },
        { text: 'Docker / VM', pct: 75 },
        { text: 'OWASP Top 10', pct: 75 },
        { text: 'C / C++', pct: 74 },
        { text: 'Nmap / WShark', pct: 72 },
        { text: 'Burp Suite', pct: 70 },
    ];

    const H = 320;
    wrapper.style.height = H + 'px';
    wrapper.style.position = 'relative';
    wrapper.innerHTML = '';

    const N = skillData.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const R = 115;

    const tags = skillData.map((sk, i) => {
        const phi = Math.acos(1 - 2 * (i + 0.5) / N);
        const theta = golden * i;
        const span = document.createElement('span');
        span.className = 'sc-tag';
        span.textContent = sk.text;
        span.title = sk.pct + '%';
        wrapper.appendChild(span);
        return {
            el: span,
            ox: Math.sin(phi) * Math.cos(theta) * R,
            oy: Math.cos(phi) * R,
            oz: Math.sin(phi) * Math.sin(theta) * R,
            size: 0.68 + (sk.pct / 100) * 0.45,
        };
    });

    let rotY = 0;
    wrapper.style.cursor = 'default';

    function update() {
        rotY += 0.006;
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cx = wrapper.clientWidth / 2;
        tags.forEach(({ el, ox, oy, oz, size }) => {
            const x = ox * cosY + oz * sinY;
            const z = -ox * sinY + oz * cosY;
            const depth = (z + R) / (2 * R); // 0=back, 1=front
            const scale = (0.55 + depth * 0.7) * size;
            const alpha = 0.2 + depth * 0.8;
            const px = cx + x - el.offsetWidth * scale / 2;
            const py = H / 2 + oy - el.offsetHeight * scale / 2;
            el.style.transform = `translate(${px}px, ${py}px) scale(${scale})`;
            el.style.opacity = alpha;
            el.style.zIndex = Math.round(z + R);
            el.style.color = depth > 0.65 ? 'var(--accent)' : depth > 0.38 ? '#ccc' : '#444';
            el.style.textShadow = depth > 0.7 ? '0 0 10px rgba(255,0,60,0.5)' : 'none';
        });
        requestAnimationFrame(update);
    }
    update();
})();

/* ══════════════════════════════════════════════════
   3D TILT CARDS
══════════════════════════════════════════════════ */
(function initTilt() {
    const MAX = 12;
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateX(${-y * MAX}deg) rotateY(${x * MAX}deg) scale(1.025)`;
            card.style.boxShadow = `${-x * 15}px ${-y * 15}px 40px rgba(255,0,60,0.15)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
            card.style.transform = '';
            card.style.boxShadow = '';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
        card.addEventListener('touchstart', e => {
            const t = e.touches[0], r = card.getBoundingClientRect();
            const x = (t.clientX - r.left) / r.width - 0.5, y = (t.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.03)`;
        }, { passive: true });
        card.addEventListener('touchend', () => { card.style.transform = ''; });
    });
})();

/* ══════════════════════════════════════════════════
   CERT FLIP — exclusive one-at-a-time
══════════════════════════════════════════════════ */
const certFlipCards = Array.from(document.querySelectorAll('.cert-flip'));

certFlipCards.forEach(card => {
    card.addEventListener('click', () => {
        const isFlipped = card.classList.contains('flipped');
        // Close all cards
        certFlipCards.forEach(c => c.classList.remove('flipped'));
        // If this card was NOT flipped, open it
        if (!isFlipped) card.classList.add('flipped');
    });
});

// Close flipped card when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.cert-flip')) {
        certFlipCards.forEach(c => c.classList.remove('flipped'));
    }
});

/* ══════════════════════════════════════════════════
   PROJECT MODALS
══════════════════════════════════════════════════ */
const PROJECTS = [
    {
        icon: '⛓️', title: 'Blockrent',
        github: 'https://github.com/Het28091/Blockrent_2026',
        stack: ['Solidity 0.8.20', 'Hardhat', 'OpenZeppelin', 'React 19', 'Node.js', 'ethers.js', 'IPFS / Pinata', 'MySQL', 'SIWE / JWT', 'Socket.io'],
        objective: 'Built a decentralized Web3 platform for renting, buying, and auctioning physical or digital assets without middlemen. Uses Ethereum smart contracts for secure transactions, automated escrows, and on-chain dispute resolution — combining blockchain guarantees with an off-chain indexer for speed.',
        achievements: [
            'Engineered BlockrentEscrow.sol — a trustless vault that holds ETH conditionally, releasing funds only on confirmed receipt or admin arbitration.',
            'Built BlockrentAuction.sol with timed bidding, automatic refunds to outbid users via pendingReturns, and state locks on expiry.',
            'Implemented Sign-In With Ethereum (SIWE) — users authenticate by cryptographically signing a nonce with MetaMask; no passwords.',
            'Dual-storage architecture: IPFS (Pinata) for immutable metadata on-chain, MySQL (Sequelize) for fast off-chain rich queries and PII compliance.',
            'On-chain dispute resolution: Admin calls resolveDispute(escrowId, buyerPercent) to split frozen funds, e.g. 100 = full buyer refund.',
            'Real-time notification system via Socket.io triggers alerts when escrow/auction state changes on-chain.',
        ],
        concepts: ['Smart Contracts', 'Escrow Pattern', 'SIWE Auth', 'IPFS / Pinata', 'Hybrid Web3 Architecture', 'On-Chain Dispute Resolution', 'Event-Driven Sync', 'Decentralized Auctions'],
    },
    {
        icon: '🔐', title: 'CipherNest',
        github: 'https://github.com/Het28091/Cipher-Nest',
        stack: ['Python', 'AES-256', 'PBKDF2', 'SQLite', 'Cryptography lib'],
        objective: 'Engineered a zero-knowledge password vault that protects credentials using military-grade cryptography, ensuring neither brute-force attacks nor database breaches can expose plaintext passwords.',
        achievements: [
            'Implemented AES-256-GCM encryption with a unique salt per entry — each entry must be cracked independently.',
            'Used PBKDF2 with 600,000 iterations + SHA-256 to make dictionary attacks computationally infeasible.',
            'Optimized database query pipeline to achieve decryption latency under 100ms for seamless UX.',
            'Zero plaintext storage — a full database dump reveals nothing without the master key.',
        ],
        concepts: ['AES-256-GCM', 'PBKDF2', 'Salting', 'Zero-Knowledge', 'Key Stretching', 'SQL Injection Prevention'],
    },
    {
        icon: '🌇', title: 'Sundown Studio',
        github: 'https://github.com/Het28091/Sundown-Studio',
        stack: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Locomotive Scroll'],
        objective: 'Crafted a visually stunning static frontend for Sundown Studio — a creative agency landing page featuring fluid scroll-driven animations, a custom cursor, smooth page transitions, and a premium glassmorphism aesthetic that showcases advanced frontend engineering.',
        achievements: [
            'Built zero-dependency scroll-driven reveal animations using Locomotive Scroll for buttery-smooth parallax effects.',
            'Implemented a custom SVG cursor with magnetic hover states on interactive elements for a premium feel.',
            'Achieved pixel-perfect responsive layouts across all breakpoints with pure CSS Grid and Flexbox.',
            'Performance-optimized asset loading with lazy-loaded sections and minimal layout shift (CLS ≈ 0).',
        ],
        concepts: ['Scroll Animation', 'Custom Cursor', 'Parallax UX', 'CSS Grid / Flexbox', 'Performance Optimization', 'Creative UI/UX'],
    },
    {
        icon: '👁️', title: 'FaceCopy',
        stack: ['Python', 'OpenCV', 'face_recognition', 'NumPy'],
        objective: 'Developed a real-time biometric authentication system for automated attendance, applying computer vision to achieve near-perfect identification accuracy.',
        achievements: [
            'Optimized HOG-based face detection pipeline in OpenCV, achieving 98% identification accuracy.',
            'Implemented real-time multi-face tracking in video streams — no single-face limitation.',
            'Attendance processing time reduced by 80% compared to manual roll-call methods.',
            'Privacy-aware design: face embeddings stored as 128-point vectors, not raw images.',
        ],
        concepts: ['HOG Face Detection', 'Face Embeddings', 'Biometric Auth', 'Privacy-by-Design', 'Real-Time CV'],
    },
    {
        icon: '☁️', title: 'Secure File Sharing System',
        stack: ['AWS S3', 'DynamoDB', 'Lambda', 'IAM', 'Python'],
        objective: 'Built a serverless file repository on AWS with enterprise-grade access controls, eliminating the risk of public data exposure while automating continuous compliance checks.',
        achievements: [
            'Enforced S3 Server-Side Encryption (SSE-S3) on all objects — at-rest data is always protected.',
            'Pre-signed URLs with TTL < 15 minutes ensure time-limited, identity-bound access — no shared links.',
            'Lambda audit functions run on every S3 event, automatically revoking any detected public ACL changes.',
            'Achieved zero public exposure by combining bucket policies with IAM Least Privilege everywhere.',
        ],
        concepts: ['SSE-S3', 'Pre-signed URLs', 'Least Privilege', 'IAM Policies', 'Event-Driven Security', 'Serverless'],
    },
];

window.openModal = function (idx) {
    const p = PROJECTS[idx];
    document.getElementById('mTitle').textContent = p.icon + ' ' + p.title;
    document.getElementById('mStack').innerHTML = p.stack.map(s => `<span>${s}</span>`).join('');
    document.getElementById('mObjective').textContent = p.objective;
    document.getElementById('mAchievements').innerHTML = p.achievements.map(a => `<li>${a}</li>`).join('');
    document.getElementById('mConcepts').innerHTML = p.concepts.map(c => `<span>${c}</span>`).join('');
    // GitHub link (only if project has one)
    let ghEl = document.getElementById('mGithubLink');
    if (!ghEl) {
        ghEl = document.createElement('a');
        ghEl.id = 'mGithubLink';
        ghEl.target = '_blank';
        ghEl.rel = 'noopener';
        ghEl.className = 'modal-github-btn';
        ghEl.textContent = 'View on GitHub \u2197';
        document.getElementById('projectModal').querySelector('.modal-header').appendChild(ghEl);
    }
    if (p.github) {
        ghEl.href = p.github;
        ghEl.style.display = 'inline-flex';
    } else {
        ghEl.style.display = 'none';
    }
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('projectModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function () {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('projectModal').classList.remove('active');
    document.body.style.overflow = '';
};

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* (Threat ticker removed) */

/* ══════════════════════════════════════════════════
   CONTACT FORM — Mailto
══════════════════════════════════════════════════ */
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const name = document.getElementById('fName').value.trim();
    const mail = document.getElementById('fEmail').value.trim();
    const subj = document.getElementById('fSubject').value.trim();
    const msg = document.getElementById('fMsg').value.trim();

    const btn = this.querySelector('button[type=submit]');

    if (!name || !mail || !subj || !msg) {
        status.textContent = 'All fields are required.';
        status.className = 'form-status err';
        return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;
    status.textContent = '';
    status.className = 'form-status';

    const useEmailJS = typeof emailjs !== 'undefined' && emailjs.send;
    if (useEmailJS) {
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            from_name: name,
            from_email: mail,
            subject: subj,
            message: msg,
            to_email: 'het2809@gmail.com',
        }).then(() => {
            status.textContent = 'Message sent successfully!';
            status.className = 'form-status ok';
            btn.textContent = 'Send Message';
            btn.disabled = false;
            this.reset();
        }).catch((err) => {
            console.error('EmailJS error:', err);
            // Fallback to mailto
            openMailto(name, mail, subj, msg);
            btn.textContent = 'Send Message';
            btn.disabled = false;
        });
    } else {
        openMailto(name, mail, subj, msg);
        btn.textContent = 'Send Message';
        btn.disabled = false;
    }

    function openMailto(n, m, s, b) {
        const href = `mailto:het2809@gmail.com?subject=${encodeURIComponent('[Portfolio] ' + s)}&body=${encodeURIComponent('From: ' + n + ' <' + m + '>\n\n' + b)}`;
        window.open(href, '_blank');
        status.textContent = 'Email client opened. If it did not open, email het2809@gmail.com directly.';
        status.className = 'form-status ok';
    }
});

/* ══════════════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
══════════════════════════════════════════════════ */
(function () {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
        links.forEach(l => { l.style.color = l.getAttribute('href') === '#' + current ? 'var(--accent)' : ''; });
    });
})();
