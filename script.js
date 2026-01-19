/* ========================================
   UOFT BAJA RACING - MAIN JAVASCRIPT
   Interactive functionality and animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initThemeToggle();
    initNavigation();
    initMobileMenu();
    initHorizontalScroll();
    initMediaLightbox();
    initScrollAnimations();
    initSmoothScroll();
    initParallax();
});

/* ========================================
   THEME TOGGLE (Dark/Light Mode)
   ======================================== */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved preference or default to light
    const savedTheme = localStorage.getItem('baja-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    toggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('baja-theme', newTheme);

        // Add transition class for smooth theme change
        html.classList.add('theme-transitioning');
        setTimeout(() => {
            html.classList.remove('theme-transitioning');
        }, 400);
    });
}

/* ========================================
   NAVIGATION
   ======================================== */
function initNavigation() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class when not at top
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hide/show nav on scroll direction (optional - uncomment if desired)
        // if (currentScroll > lastScroll && currentScroll > 200) {
        //     nav.style.transform = 'translateY(-100%)';
        // } else {
        //     nav.style.transform = 'translateY(0)';
        // }

        lastScroll = currentScroll;
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ========================================
   MOBILE MENU
   ======================================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelector('.nav-links');

    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        toggle.classList.toggle('active');

        // Animate hamburger to X
        const spans = toggle.querySelectorAll('span');
        if (toggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            const spans = toggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

/* ========================================
   HORIZONTAL SCROLL - HISTORY TIMELINE
   ======================================== */
function initHorizontalScroll() {
    const container = document.querySelector('.history-track-container');
    const track = document.querySelector('.history-track');
    const car = document.getElementById('trackCar');
    const progressFill = document.getElementById('historyProgress');
    const progressPath = container.querySelector('.terrain-progress');
    const terrainPath = container.querySelector('.terrain-path');
    const terrainSvg = container.querySelector('.terrain-svg');

    if (!container || !track) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let progressPathLength = 0;
    let terrainPathLength = 0;
    let terrainViewBox = { width: 0, height: 0 };

    if (progressPath) {
        progressPathLength = progressPath.getTotalLength();
        progressPath.style.strokeDasharray = `${progressPathLength}`;
        progressPath.style.strokeDashoffset = `${progressPathLength}`;
        progressPath.style.transition = 'stroke-dashoffset 0.3s ease';
    }

    if (terrainPath && terrainSvg) {
        terrainPathLength = terrainPath.getTotalLength();
        const viewBox = terrainSvg.viewBox.baseVal;
        terrainViewBox = { width: viewBox.width, height: viewBox.height };
    }

    function getScrollPercent() {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft <= 0) return 0;
        return Math.min(1, Math.max(0, container.scrollLeft / maxScrollLeft));
    }

    function updateTimeline() {
        const scrollPercent = getScrollPercent();
        const trackWidth = track.scrollWidth - 200; // Account for padding

        // Move the car along the terrain curve
        if (car && terrainPath && terrainSvg && terrainPathLength) {
            const distance = terrainPathLength * scrollPercent;
            const point = terrainPath.getPointAtLength(distance);
            const pointAhead = terrainPath.getPointAtLength(Math.min(terrainPathLength, distance + 10));
            const angle = Math.atan2(pointAhead.y - point.y, pointAhead.x - point.x) * (180 / Math.PI);
            const svgRect = terrainSvg.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            const scaleX = svgRect.width / terrainViewBox.width;
            const scaleY = svgRect.height / terrainViewBox.height;
            const x = (point.x * scaleX) + (svgRect.left - trackRect.left);
            const y = (point.y * scaleY) + (svgRect.top - trackRect.top);

            car.style.left = `${x}px`;
            car.style.top = `${y}px`;
            car.style.setProperty('--car-rotate', `${angle}deg`);
        } else if (car) {
            const carPosition = 100 + (scrollPercent * (trackWidth - 200));
            car.style.left = `${carPosition}px`;
        }

        // Update progress bar
        if (progressFill) {
            progressFill.style.width = `${scrollPercent * 100}%`;
        }

        // Update terrain progress stroke
        if (progressPath && progressPathLength) {
            progressPath.style.strokeDashoffset = `${progressPathLength * (1 - scrollPercent)}`;
        }

        // Highlight active milestone
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach((milestone, index) => {
            const milestoneProgress = index / (milestones.length - 1);
            if (scrollPercent >= milestoneProgress - 0.1) {
                milestone.classList.add('active');
            } else {
                milestone.classList.remove('active');
            }
        });
    }

    // Mouse drag scrolling
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });

    // Update car position and progress on scroll
    container.addEventListener('scroll', () => {
        updateTimeline();
    });

    // Wheel scroll to horizontal scroll, release when at ends for page scroll
    container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            const atStart = container.scrollLeft <= 0;
            const atEnd = container.scrollLeft >= maxScrollLeft - 1;
            const scrollingLeft = e.deltaY < 0;

            if ((scrollingLeft && !atStart) || (!scrollingLeft && !atEnd)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        }
    }, { passive: false });

    // Touch support for mobile
    let touchStartX = 0;
    let touchScrollLeft = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].pageX;
        const walk = (touchStartX - touchX) * 1.5;
        container.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (progressPath) {
            progressPathLength = progressPath.getTotalLength();
            progressPath.style.strokeDasharray = `${progressPathLength}`;
        }

        if (terrainPath && terrainSvg) {
            terrainPathLength = terrainPath.getTotalLength();
            const viewBox = terrainSvg.viewBox.baseVal;
            terrainViewBox = { width: viewBox.width, height: viewBox.height };
        }

        updateTimeline();
    });

    updateTimeline();
}

/* ========================================
   SCROLL ANIMATIONS (Reveal on Scroll)
   ======================================== */
function initScrollAnimations() {
    // Add reveal class to elements
    const animatedElements = document.querySelectorAll(`
        .section-header,
        .about-intro,
        .event-card,
        .stat,
        .subteam-card,
        .team-member,
        .team-member-small,
        .sponsor-tier,
        .sponsor-cta,
        .join-feature
    `);

    animatedElements.forEach((el, index) => {
        el.classList.add('reveal');
        // Add stagger classes to groups
        if (el.classList.contains('event-card') ||
            el.classList.contains('stat') ||
            el.classList.contains('subteam-card') ||
            el.classList.contains('join-feature')) {
            const staggerIndex = (index % 6) + 1;
            el.classList.add(`stagger-${staggerIndex}`);
        }
    });

    // Intersection Observer for reveal animations
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Hero animations
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title-line, .hero-subtitle, .hero-ctas');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   PARALLAX EFFECTS
   ======================================== */
function initParallax() {
    const heroGrid = document.querySelector('.hero-grid');
    const heroDust = document.querySelector('.hero-dust');
    const heroCarSilhouette = document.querySelector('.hero-car-silhouette');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;

        if (heroGrid) {
            heroGrid.style.transform = `translate(${rate * 0.1}px, ${rate * 0.1}px)`;
        }

        if (heroDust) {
            heroDust.style.transform = `translateY(${rate * 0.5}px)`;
        }

        if (heroCarSilhouette) {
            heroCarSilhouette.style.transform = `translateX(${rate * 0.2}px)`;
        }
    });

    // Mouse parallax on hero
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;

            if (heroGrid) {
                heroGrid.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
            }
        });
    }
}

/* ========================================
   MEDIA LIGHTBOX
   ======================================== */
function initMediaLightbox() {
    const lightbox = document.getElementById('mediaLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const mediaCards = document.querySelectorAll('.media-card');

    if (!lightbox || !lightboxImage || mediaCards.length === 0) return;

    function openLightbox(image) {
        if (!image) return;
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt || 'Media image';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.src = '';
        document.body.style.overflow = '';
    }

    mediaCards.forEach(card => {
        card.addEventListener('click', () => {
            const image = card.querySelector('img');
            openLightbox(image);
        });
    });

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* ========================================
   COUNTER ANIMATION
   ======================================== */
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// Animate stats when in view
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const text = entry.target.textContent;
            const num = parseInt(text);
            if (!isNaN(num) && num > 0) {
                animateCounter(entry.target, num);
            }
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statsObserver.observe(stat));

/* ========================================
   TYPING EFFECT (Optional)
   ======================================== */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/* ========================================
   CURSOR EFFECTS (Optional - Premium feel)
   ======================================== */
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
    });

    // Enlarge cursor on hover
    document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Uncomment to enable custom cursor:
// initCustomCursor();

/* ========================================
   PRELOADER (Optional)
   ======================================== */
function initPreloader() {
    const preloader = document.createElement('div');
    preloader.classList.add('preloader');
    preloader.innerHTML = `
        <div class="preloader-content">
            <span class="preloader-logo">UOFT BAJA</span>
            <div class="preloader-bar">
                <div class="preloader-progress"></div>
            </div>
        </div>
    `;
    document.body.prepend(preloader);

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
            setTimeout(() => preloader.remove(), 500);
        }, 500);
    });
}

// Uncomment to enable preloader:
// initPreloader();

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

// Debounce function for performance
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

console.log('🏎️ UofT Baja Racing - Website Loaded');
console.log('Engineering grit. Building legacy.');
