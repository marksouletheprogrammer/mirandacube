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
