document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('.scene');
    const cube = document.getElementById('cube');
    const birthdayBackArrow = document.getElementById('birthday-back-arrow');
    const birthdayGridView = document.getElementById('birthday-grid-view');
    const birthdayFlash = document.getElementById('birthday-flash');
    let current = 'front';
    let rotating = false;
    let mode = 'main';
    let locked = false;
    const CUBE_ROTATE_MS = 950;
    const GRID_TRANSITION_MS = 280;
    const SHELL_ANIM_MS = 220;
    const FLASH_LEAD_MS = 150;

    function setLock(ms) {
        locked = true;
        setTimeout(() => { locked = false; }, ms);
    }

    function showFace(face, force) {
        if (((rotating || locked) && !force) || face === current) return false;
        rotating = true;
        current = face;
        cube.className = 'cube show-' + face;
        playSound(face === 'front' ? 330 : 440);
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
        playSound(330);

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

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (locked || rotating) return;

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

    // Sound
    function playSound(freq) {
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

    // Start on front
    cube.classList.add('show-front');
});
