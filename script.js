document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('.scene');
    const cube = document.getElementById('cube');
    const birthdayBackArrow = document.getElementById('birthday-back-arrow');
    const birthdayGridView = document.getElementById('birthday-grid-view');
    const birthdayFlash = document.getElementById('birthday-flash');
    const photoViewer = document.getElementById('photo-viewer');
    const photoViewerImage = document.getElementById('photo-viewer-image');
    const photoViewerBack = document.getElementById('photo-viewer-back');
    let current = 'front';
    let rotating = false;
    let mode = 'main';
    let locked = false;
    const CUBE_ROTATE_MS = 950;
    const GRID_TRANSITION_MS = 280;
    const SHELL_ANIM_MS = 220;
    const FLASH_LEAD_MS = 150;

    // Pixel font map: each letter is 5 wide × 7 tall (binary strings)
    const PIXEL_FONT = {
        'H': ['10001','10001','10001','11111','10001','10001','10001'],
        'A': ['01110','10001','10001','11111','10001','10001','10001'],
        'P': ['11110','10001','10001','11110','10000','10000','10000'],
        'Y': ['10001','10001','01010','00100','00100','00100','00100'],
        'B': ['11110','10001','10001','11110','10001','10001','11110'],
        'I': ['11111','00100','00100','00100','00100','00100','11111'],
        'R': ['11110','10001','10001','11110','10100','10010','10001'],
        'T': ['11111','00100','00100','00100','00100','00100','00100'],
        'D': ['11100','10010','10001','10001','10001','10010','11100'],
        'M': ['10001','11011','10101','10101','10001','10001','10001'],
        'N': ['10001','11001','10101','10101','10011','10001','10001'],
        ' ': ['00000','00000','00000','00000','00000','00000','00000'],
    };

    function renderCubeText(containerId, text) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const words = text.toUpperCase().split(' ');
        words.forEach((word, wi) => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'cube-word';
            for (let ci = 0; ci < word.length; ci++) {
                const ch = word[ci];
                const rows = PIXEL_FONT[ch];
                if (!rows) continue;
                const letterDiv = document.createElement('div');
                letterDiv.className = 'cube-letter';
                for (let r = 0; r < 7; r++) {
                    for (let c = 0; c < 5; c++) {
                        const pixel = document.createElement('div');
                        if (rows[r][c] === '1') {
                            pixel.className = 'cube-pixel';
                        } else {
                            pixel.className = 'cube-pixel-empty';
                        }
                        letterDiv.appendChild(pixel);
                    }
                }
                wordDiv.appendChild(letterDiv);
            }
            container.appendChild(wordDiv);
        });
    }

    // Text particle system
    const textParticleShapes = ['×', '○', '△', '□'];
    const textParticleColors = [
        'rgba(200, 170, 235, 0.7)',
        'rgba(170, 215, 180, 0.7)',
        'rgba(240, 200, 220, 0.7)',
        'rgba(235, 220, 180, 0.7)',
        'rgba(190, 200, 235, 0.7)',
    ];
    let textParticleTimers = [];
    let textParticleElements = [];

    function spawnTextParticle() {
        if (mode !== 'birthday-grid') return;

        const containers = [
            document.getElementById('birthday-text-top'),
            document.getElementById('birthday-text-bottom')
        ];
        const container = containers[Math.floor(Math.random() * containers.length)];
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const el = document.createElement('span');
        el.className = 'cube-text-particle';
        el.textContent = textParticleShapes[Math.floor(Math.random() * textParticleShapes.length)];
        el.style.color = textParticleColors[Math.floor(Math.random() * textParticleColors.length)];

        // Position at random edge of the text container
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { el.style.left = (rect.left + Math.random() * rect.width) + 'px'; el.style.top = (rect.top - 5) + 'px'; }
        else if (side === 1) { el.style.left = (rect.left + Math.random() * rect.width) + 'px'; el.style.top = (rect.bottom + 5) + 'px'; }
        else if (side === 2) { el.style.left = (rect.left - 10) + 'px'; el.style.top = (rect.top + Math.random() * rect.height) + 'px'; }
        else { el.style.left = (rect.right + 10) + 'px'; el.style.top = (rect.top + Math.random() * rect.height) + 'px'; }

        const anims = ['spring-float-up', 'spring-drift-right', 'spring-drift-left', 'spring-wander'];
        const anim = anims[Math.floor(Math.random() * anims.length)];
        const dur = 4 + Math.random() * 6;
        el.style.animationName = anim;
        el.style.animationDuration = dur + 's';

        document.body.appendChild(el);
        textParticleElements.push(el);

        const removeTimer = setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            textParticleElements = textParticleElements.filter(e => e !== el);
        }, dur * 1000 + 200);
        textParticleTimers.push(removeTimer);

        // Schedule next
        if (mode === 'birthday-grid') {
            const next = setTimeout(() => spawnTextParticle(), (1 + Math.random() * 3) * 1000);
            textParticleTimers.push(next);
        }
    }

    function startTextParticles() {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const t = setTimeout(() => spawnTextParticle(), 600 + i * (300 + Math.random() * 600));
            textParticleTimers.push(t);
        }
    }

    function clearTextParticles() {
        textParticleTimers.forEach(t => clearTimeout(t));
        textParticleTimers = [];
        textParticleElements.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
        textParticleElements = [];
    }

    // Render cube text on load
    renderCubeText('birthday-text-top', 'Happy Birthday');
    renderCubeText('birthday-text-bottom', 'Miranda');

    // Load photos from birthday folder
    // Note: Update this array when adding/removing photos from the birthday/ folder
    function loadBirthdayPhotos() {
        const photos = ['b.png', 'c.png', 'd.png', 'e.png', 'f.jpg', 'g.jpg', 'z.png'];
        const memoryCubes = document.querySelectorAll('.memory-cube');
        
        // Sort alphabetically
        photos.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (photos.length > 9) {
            console.error(`Warning: Found ${photos.length} photos in birthday folder. Only first 9 will be displayed.`);
        }

        const photosToUse = photos.slice(0, 9);

        photosToUse.forEach((photo, index) => {
            if (memoryCubes[index]) {
                const cube = memoryCubes[index];
                const face = cube.querySelector('.memory-cube-face-front');
                face.style.backgroundImage = `url('birthday/${photo}')`;
                cube.setAttribute('data-photo', photo);
            }
        });

        if (photos.length === 0) {
            console.info('No photos found in birthday folder');
        }
    }

    loadBirthdayPhotos();

    function setLock(ms) {
        locked = true;
        setTimeout(() => { locked = false; }, ms);
    }

    function showFace(face, force) {
        if (((rotating || locked) && !force) || face === current) return false;
        rotating = true;
        current = face;
        cube.className = 'cube show-' + face;
        if (face === 'front') playSimpleSound(330); else playSound(440);
        setTimeout(() => { rotating = false; }, CUBE_ROTATE_MS);
        return true;
    }

    // Birthday diddy + confetti (first time only)
    let birthdayDiddyPlayed = false;

    function playBirthdayDiddy() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const t = ctx.currentTime;
            // C5, E5, G5, C6, G5, A5, B5, C6
            const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 880.00, 987.77, 1046.50];
            const durations = [0.28, 0.28, 0.28, 0.35, 0.22, 0.22, 0.22, 0.50];
            let offset = 0;
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + offset);
                gain.gain.setValueAtTime(0.1, t + offset);
                gain.gain.setValueAtTime(0.1, t + offset + durations[i] * 0.6);
                gain.gain.exponentialRampToValueAtTime(0.001, t + offset + durations[i]);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + offset);
                osc.stop(t + offset + durations[i] + 0.05);

                // Sparkle harmonic
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(freq * 2, t + offset);
                gain2.gain.setValueAtTime(0.03, t + offset);
                gain2.gain.exponentialRampToValueAtTime(0.001, t + offset + durations[i] * 0.8);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(t + offset);
                osc2.stop(t + offset + durations[i]);

                offset += durations[i] * 0.85;
            });
        } catch (e) {}
    }

    function fireConfetti() {
        const count = 80 + Math.floor(Math.random() * 40);
        const colors = [
            'rgba(200, 170, 235, 0.9)',
            'rgba(160, 215, 175, 0.9)',
            'rgba(240, 190, 210, 0.9)',
            'rgba(235, 215, 160, 0.9)',
            'rgba(175, 200, 240, 0.9)',
            'rgba(220, 180, 240, 0.9)',
            'rgba(240, 175, 170, 0.9)',
        ];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const isRect = Math.random() > 0.5;
            el.style.width = isRect ? '8px' : '6px';
            el.style.height = isRect ? '4px' : '6px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.setProperty('--x', ((Math.random() - 0.5) * 80) + 'vw');
            el.style.setProperty('--y', (-(50 + Math.random() * 25)) + 'vh');
            el.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
            el.style.left = '50vw';
            el.style.top = '85vh';
            el.style.animationDelay = (Math.random() * 0.3) + 's';
            el.style.animationDuration = (2.5 + Math.random() * 1) + 's';
            document.body.appendChild(el);
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 4000);
        }
    }

    function enterBirthdayGrid() {
        if (mode !== 'main' || locked || current !== 'front') return;
        if (!showFace('top', false)) return;

        setLock(CUBE_ROTATE_MS + FLASH_LEAD_MS + GRID_TRANSITION_MS + 120);
        setTimeout(() => {
            birthdayFlash.classList.remove('is-flash-closing');
            birthdayFlash.classList.add('is-flash-opening');
            scene.classList.remove('is-birthday-closing');
            scene.classList.add('is-birthday-opening');
            setTimeout(() => {
                mode = 'birthday-grid';
                scene.classList.add('is-birthday-grid');
                birthdayGridView.setAttribute('aria-hidden', 'false');
                startTextParticles();
                if (!birthdayDiddyPlayed) {
                    birthdayDiddyPlayed = true;
                    setTimeout(() => {
                        playBirthdayDiddy();
                        fireConfetti();
                    }, 500);
                }
                setTimeout(() => {
                    birthdayFlash.classList.remove('is-flash-opening');
                    scene.classList.remove('is-birthday-opening');
                }, GRID_TRANSITION_MS);
            }, FLASH_LEAD_MS);
        }, CUBE_ROTATE_MS - 50);
    }

    function exitBirthdayGrid() {
        if (mode !== 'birthday-grid' || locked) return;

        setLock(650);
        mode = 'main';
        playSimpleSound(330);
        clearTextParticles();

        // Fire flash to mask the swap
        birthdayFlash.classList.remove('is-flash-opening');
        birthdayFlash.classList.remove('is-flash-closing');
        void birthdayFlash.offsetHeight;
        birthdayFlash.classList.add('is-flash-closing');

        // At flash peak (~100ms), do instant swap behind the bright flash
        setTimeout(() => {
            cube.style.transition = 'none';
            birthdayGridView.style.transition = 'none';
            cube.className = 'cube show-front';
            current = 'front';
            scene.classList.remove('is-birthday-grid');
            birthdayGridView.setAttribute('aria-hidden', 'true');
            void cube.offsetHeight;
            cube.style.transition = '';
            birthdayGridView.style.transition = '';
        }, 100);

        // Clean up flash after animation ends
        setTimeout(() => {
            birthdayFlash.classList.remove('is-flash-closing');
        }, 560);
    }

    // Spring effects config — all CSS-drawn shapes, no emoji
    const pollenColors = ['pollen-lavender', 'pollen-mint', 'pollen-pink', 'pollen-gold', 'pollen-blue'];
    const springEffects = [
        // Hearts
        { cls: 'spring-heart', anim: 'spring-float-up', dur: [7, 12] },
        { cls: 'spring-heart', anim: 'spring-wander', dur: [9, 14] },
        // Butterflies
        { cls: 'spring-butterfly', anim: 'spring-zigzag', dur: [8, 13] },
        { cls: 'spring-butterfly', anim: 'spring-wander', dur: [10, 15] },
        // Flowers
        { cls: 'spring-flower', anim: 'spring-bloom', dur: [7, 12] },
        { cls: 'spring-flower', anim: 'spring-float-up', dur: [9, 13] },
        // Leaves
        { cls: 'spring-leaf', anim: 'spring-float-up', dur: [7, 12] },
        { cls: 'spring-leaf', anim: 'spring-wander', dur: [8, 13] },
        { cls: 'spring-leaf', anim: 'spring-drift-right', dur: [6, 11] },
        { cls: 'spring-leaf', anim: 'spring-drift-left', dur: [6, 11] },
        // Sparkles
        { cls: 'spring-sparkle', anim: 'spring-twinkle', dur: [3, 6] },
        { cls: 'spring-sparkle', anim: 'spring-twinkle', dur: [4, 7] },
        // Pollen particles (multiple colors)
        { cls: 'spring-pollen', anim: 'spring-drift-right', dur: [5, 9], pollen: true },
        { cls: 'spring-pollen', anim: 'spring-drift-left', dur: [5, 9], pollen: true },
        { cls: 'spring-pollen', anim: 'spring-float-up', dur: [6, 10], pollen: true },
        { cls: 'spring-pollen', anim: 'spring-wander', dur: [7, 11], pollen: true },
        { cls: 'spring-pollen', anim: 'spring-drift-right', dur: [4, 7], pollen: true },
        { cls: 'spring-pollen', anim: 'spring-float-up', dur: [5, 8], pollen: true },
    ];

    let springTimers = [];
    let springElements = [];

    function randRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function spawnSpringEffect() {
        if (mode !== 'photo-viewer') return;

        const effect = springEffects[Math.floor(Math.random() * springEffects.length)];
        const el = document.createElement('div');
        el.className = 'spring-effect ' + effect.cls;

        // Add random pollen color if pollen type
        if (effect.pollen) {
            el.classList.add(pollenColors[Math.floor(Math.random() * pollenColors.length)]);
        }

        // Position in void space (edges of viewport, outside photo area)
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // left edge
                el.style.left = randRange(2, 12) + 'vw';
                el.style.top = randRange(15, 85) + 'vh';
                break;
            case 1: // right edge
                el.style.left = randRange(88, 97) + 'vw';
                el.style.top = randRange(15, 85) + 'vh';
                break;
            case 2: // top edge
                el.style.left = randRange(10, 90) + 'vw';
                el.style.top = randRange(3, 12) + 'vh';
                break;
            case 3: // bottom edge
                el.style.left = randRange(10, 90) + 'vw';
                el.style.top = randRange(78, 92) + 'vh';
                break;
        }

        const duration = randRange(effect.dur[0], effect.dur[1]);
        el.style.animationName = effect.anim;
        el.style.animationDuration = duration + 's';

        photoViewer.appendChild(el);
        springElements.push(el);

        // Remove after animation completes
        const removeTimer = setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
            springElements = springElements.filter(e => e !== el);
        }, duration * 1000 + 200);
        springTimers.push(removeTimer);

        // Schedule next effect (3-7s for visible activity)
        if (mode === 'photo-viewer') {
            const nextDelay = randRange(3, 7) * 1000;
            const nextTimer = setTimeout(() => spawnSpringEffect(), nextDelay);
            springTimers.push(nextTimer);

            // Sometimes spawn a pollen burst (2-3 extra pollen nearby)
            if (Math.random() < 0.4) {
                const burstCount = Math.floor(randRange(2, 4));
                for (let b = 0; b < burstCount; b++) {
                    const burstTimer = setTimeout(() => {
                        if (mode !== 'photo-viewer') return;
                        const pollenEffects = springEffects.filter(e => e.pollen);
                        const pe = pollenEffects[Math.floor(Math.random() * pollenEffects.length)];
                        const pel = document.createElement('div');
                        pel.className = 'spring-effect ' + pe.cls + ' ' + pollenColors[Math.floor(Math.random() * pollenColors.length)];
                        // Scatter near the parent effect's area
                        const side = Math.floor(Math.random() * 4);
                        if (side === 0) { pel.style.left = randRange(2, 14) + 'vw'; pel.style.top = randRange(15, 85) + 'vh'; }
                        else if (side === 1) { pel.style.left = randRange(86, 97) + 'vw'; pel.style.top = randRange(15, 85) + 'vh'; }
                        else if (side === 2) { pel.style.left = randRange(10, 90) + 'vw'; pel.style.top = randRange(3, 14) + 'vh'; }
                        else { pel.style.left = randRange(10, 90) + 'vw'; pel.style.top = randRange(76, 92) + 'vh'; }
                        const dur = randRange(pe.dur[0], pe.dur[1]);
                        pel.style.animationName = pe.anim;
                        pel.style.animationDuration = dur + 's';
                        photoViewer.appendChild(pel);
                        springElements.push(pel);
                        const rt = setTimeout(() => {
                            if (pel.parentNode) pel.parentNode.removeChild(pel);
                            springElements = springElements.filter(e => e !== pel);
                        }, dur * 1000 + 200);
                        springTimers.push(rt);
                    }, b * randRange(300, 800));
                    springTimers.push(burstTimer);
                }
            }
        }
    }

    function startSpringEffects() {
        // Initial delay of 10-20 seconds before first effects appear
        const initialDelay = randRange(10, 20) * 1000;
        const count = Math.floor(randRange(2, 5)); // 2-4 effects
        for (let i = 0; i < count; i++) {
            const stagger = initialDelay + i * randRange(600, 1800);
            const timer = setTimeout(() => spawnSpringEffect(), stagger);
            springTimers.push(timer);
        }
    }

    function clearSpringEffects() {
        springTimers.forEach(t => clearTimeout(t));
        springTimers = [];
        springElements.forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        springElements = [];
    }

    function openPhotoViewer(photoFilename) {
        if (mode !== 'birthday-grid' || locked) return;

        setLock(400);
        mode = 'photo-viewer';
        photoViewerImage.src = `birthday/${photoFilename}`;
        scene.classList.add('is-photo-viewer');
        photoViewer.setAttribute('aria-hidden', 'false');
        playSimpleSound(550);
        startSpringEffects();
    }

    function closePhotoViewer() {
        if (mode !== 'photo-viewer' || locked) return;

        setLock(400);
        mode = 'birthday-grid';
        scene.classList.remove('is-photo-viewer');
        photoViewer.setAttribute('aria-hidden', 'true');
        playSimpleSound(330);
        clearSpringEffects();

        setTimeout(() => {
            photoViewerImage.src = '';
        }, 350);
    }

    // Menu option clicks
    document.querySelectorAll('.menu-option').forEach(el => {
        el.addEventListener('click', () => {
            if (locked || mode !== 'main') return;

            if (el.dataset.option === 'birthday') {
                enterBirthdayGrid();
                return;
            }

            showFace(el.dataset.face, false);
        });
    });

    // Back arrow clicks
    document.querySelectorAll('.back-arrow').forEach(el => {
        el.addEventListener('click', () => {
            if (locked || mode !== 'main') return;
            showFace(el.dataset.return, false);
        });
    });

    birthdayBackArrow.addEventListener('click', exitBirthdayGrid);

    // Memory cube clicks (for photos)
    document.querySelectorAll('.memory-cube').forEach(cube => {
        cube.addEventListener('click', () => {
            const photoFilename = cube.getAttribute('data-photo');
            if (photoFilename) {
                openPhotoViewer(photoFilename);
            }
        });
    });

    // Photo viewer back button
    photoViewerBack.addEventListener('click', closePhotoViewer);

    // Handle image load errors
    photoViewerImage.addEventListener('error', () => {
        console.error('Failed to load photo:', photoViewerImage.src);
        closePhotoViewer();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (locked || rotating) return;

        if (mode === 'photo-viewer') {
            if (e.key === 'Escape') {
                e.preventDefault();
                closePhotoViewer();
            }
            return;
        }

        if (mode === 'birthday-grid') {
            if (e.key === 'Escape') {
                e.preventDefault();
                exitBirthdayGrid();
            }
            return;
        }

        const map = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'top', ArrowDown: 'bottom', Escape: 'front' };
        const face = map[e.key];
        if (face) {
            e.preventDefault();
            showFace(current === 'front' ? face : 'front', false);
        }
    });

    // Sound — original simple sine sweep (for back navigation)
    function playSimpleSound(freq) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {}
    }

    // Sound — GameCube-inspired bubbly whoosh (for forward navigation)
    function playSound(freq) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const t = ctx.currentTime;

            // Main tone: sine sweep down
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(freq * 1.2, t);
            osc1.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.18);
            gain1.gain.setValueAtTime(0.07, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.22);

            // Detuned twin: slight warble for bubbly character
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 1.2, t);
            osc2.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.18);
            osc2.detune.setValueAtTime(25, t);
            gain2.gain.setValueAtTime(0.04, t);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(t);
            osc2.stop(t + 0.20);

            // Harmonic overtone: triangle at 2x freq for sparkle
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(freq * 2, t);
            osc3.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.12);
            gain3.gain.setValueAtTime(0.025, t);
            gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start(t);
            osc3.stop(t + 0.14);
        } catch (e) {}
    }

    // Start on front
    cube.classList.add('show-front');
});
