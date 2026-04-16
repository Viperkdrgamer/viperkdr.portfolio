// Navigation functionality
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

// Page navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetPage) {
                page.classList.add('active');
            }
        });

        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Mobile hamburger menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Parallax effect for gradient orbs
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 30;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 30;
});

function animateOrbs() {
    const orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        if (index === 0) {
            orb.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
        } else if (index === 1) {
            orb.style.transform = `translate(${-mouseX * speed}px, ${-mouseY * speed}px)`;
        } else {
            orb.style.transform = `translate(${mouseX * speed * 0.5}px, ${mouseY * speed * 0.5}px)`;
        }
    });
    requestAnimationFrame(animateOrbs);
}
animateOrbs();

// 3D tilt effect on project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        // Don't tilt if hovering over controls
        if (e.target.closest('.video-controls')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ──────────────────────────────────────────
// CUSTOM VIDEO PLAYER CONTROLS
// ──────────────────────────────────────────

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

document.querySelectorAll('.project-media').forEach(mediaContainer => {
    const video = mediaContainer.querySelector('video');
    if (!video) return; // skip images / iframes

    // ── Build the controls HTML ──
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.innerHTML = `
        <div class="vc-progress-wrap">
            <div class="vc-progress">
                <div class="vc-progress-fill"></div>
                <div class="vc-progress-thumb"></div>
            </div>
        </div>
        <div class="vc-bottom">
            <button class="vc-btn vc-play" title="Play / Pause">
                <i class="fas fa-pause"></i>
            </button>
            <span class="vc-time">0:00 / 0:00</span>
            <div class="vc-right">
                <button class="vc-btn vc-mute" title="Mute / Unmute">
                    <i class="fas fa-volume-high"></i>
                </button>
                <button class="vc-btn vc-fullscreen" title="Fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
    mediaContainer.appendChild(controls);

    // ── Grab control elements ──
    const playBtn       = controls.querySelector('.vc-play i');
    const muteBtn       = controls.querySelector('.vc-mute i');
    const fsBtn         = controls.querySelector('.vc-fullscreen i');
    const timeDisplay   = controls.querySelector('.vc-time');
    const progressWrap  = controls.querySelector('.vc-progress-wrap');
    const progressFill  = controls.querySelector('.vc-progress-fill');
    const progressThumb = controls.querySelector('.vc-progress-thumb');

    // Remove the old overlay so it doesn't block clicks
    const oldOverlay = mediaContainer.querySelector('.video-overlay');
    if (oldOverlay) oldOverlay.remove();

    // ── Play / Pause button ──
    playBtn.parentElement.addEventListener('click', (e) => {
        e.stopPropagation();
        video.paused ? video.play() : video.pause();
    });

    video.addEventListener('play', () => {
        playBtn.classList.replace('fa-play', 'fa-pause');
    });
    video.addEventListener('pause', () => {
        playBtn.classList.replace('fa-pause', 'fa-play');
    });

    // ── Mute / Unmute button ──
    muteBtn.parentElement.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        updateMuteIcon();
    });

    function updateMuteIcon() {
        muteBtn.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-xmark');
        if (video.muted || video.volume === 0) {
            muteBtn.classList.add('fa-volume-xmark');
        } else if (video.volume < 0.5) {
            muteBtn.classList.add('fa-volume-low');
        } else {
            muteBtn.classList.add('fa-volume-high');
        }
    }
    video.addEventListener('volumechange', updateMuteIcon);

    // ── Fullscreen button ──
    fsBtn.parentElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            mediaContainer.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement === mediaContainer) {
            fsBtn.classList.replace('fa-expand', 'fa-compress');
        } else {
            fsBtn.classList.replace('fa-compress', 'fa-expand');
        }
    });

    // ── Progress bar (seek) ──
    let dragging = false;

    function seekFromEvent(e) {
        const rect = progressWrap.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = pct * video.duration;
    }

    progressWrap.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragging = true;
        seekFromEvent(e);
    });
    document.addEventListener('mousemove', (e) => {
        if (dragging) seekFromEvent(e);
    });
    document.addEventListener('mouseup', () => {
        dragging = false;
    });

    // Touch support for mobile
    progressWrap.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        dragging = true;
        seekFromEvent(e.touches[0]);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (dragging) seekFromEvent(e.touches[0]);
    }, { passive: true });
    document.addEventListener('touchend', () => {
        dragging = false;
    });

    // ── Update progress & time display every frame ──
    video.addEventListener('timeupdate', () => {
        if (dragging) return;
        const pct = (video.currentTime / video.duration) * 100 || 0;
        progressFill.style.width  = pct + '%';
        progressThumb.style.left  = pct + '%';
        timeDisplay.textContent   = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });

    // ── Auto-hide controls after 2s of no mouse activity ──
    let hideTimeout;
    function resetHideTimer() {
        clearTimeout(hideTimeout);
        controls.classList.add('visible');
        hideTimeout = setTimeout(() => controls.classList.remove('visible'), 2000);
    }
    mediaContainer.addEventListener('mousemove', resetHideTimer);
    mediaContainer.addEventListener('mouseenter', resetHideTimer);
    mediaContainer.addEventListener('mouseleave', () => {
        clearTimeout(hideTimeout);
        controls.classList.remove('visible');
    });
    // Keep visible on touch devices
    mediaContainer.addEventListener('touchstart', () => {
        controls.classList.add('visible');
        resetHideTimer();
    }, { passive: true });
});

// ──────────────────────────────────────────
// SCROLL REVEAL
// ──────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.project-card, .glass-card').forEach(card => observer.observe(card));

window.addEventListener('load', () => {
    document.querySelector('.page.active').style.opacity = '1';
});

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ──────────────────────────────────────────
// KONAMI CODE EASTER EGG
// ──────────────────────────────────────────
let konamiCode = [];
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        const gradientText = document.querySelector('.gradient-text');
        gradientText.style.background = 'linear-gradient(135deg, #ff0000, #ff7700, #ffdd00, #00ff00, #0099ff, #6600ff, #ff0099)';
        gradientText.style.backgroundSize = '400% 400%';
        gradientText.style.animation = 'gradientShift 2s ease infinite';

        const message = document.createElement('div');
        message.textContent = '🎮 Konami Code Activated! 🎮';
        message.style.cssText = `
            position:fixed; top:50%; left:50%;
            transform:translate(-50%,-50%);
            background:linear-gradient(135deg,#2563eb,#06b6d4);
            padding:2rem 3rem; border-radius:20px;
            font-size:1.5rem; font-weight:bold;
            z-index:10000; animation:fadeIn 0.5s ease;
            box-shadow:0 20px 60px rgba(0,0,0,0.5);
            color:#fff;
        `;
        document.body.appendChild(message);
        setTimeout(() => {
            message.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => message.remove(), 500);
        }, 2000);
        konamiCode = [];
    }
});



const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity:1; transform:translate(-50%,-50%) scale(1); }
        to   { opacity:0; transform:translate(-50%,-50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

console.log('%c🎮 Roblox Developer Portfolio', 'color:#06b6d4; font-size:24px; font-weight:bold;');
console.log('%cTry the Konami Code! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA', 'color:#8b5cf6; font-size:14px;');