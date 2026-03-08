document.addEventListener('DOMContentLoaded', () => {
    const cube = document.getElementById('cube');
    let current = 'front';
    let rotating = false;

    function showFace(face) {
        if (rotating || face === current) return;
        rotating = true;
        current = face;
        cube.className = 'cube show-' + face;
        playSound(face === 'front' ? 330 : 440);
        setTimeout(() => { rotating = false; }, 950);
    }

    // Menu option clicks
    document.querySelectorAll('.menu-option').forEach(el => {
        el.addEventListener('click', () => showFace(el.dataset.face));
    });

    // Back arrow clicks
    document.querySelectorAll('.back-arrow').forEach(el => {
        el.addEventListener('click', () => showFace(el.dataset.return));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (rotating) return;
        const map = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'top', ArrowDown: 'bottom', Escape: 'front' };
        const face = map[e.key];
        if (face) {
            e.preventDefault();
            showFace(current === 'front' ? face : 'front');
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
