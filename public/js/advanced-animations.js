/**
 * ICT AI Knowledge System - Professional Animations
 * Clean, modern animations inspired by Ragie.ai design principles
 */

// Animation configuration
const ANIMATION_CONFIG = {
    duration: {
        fast: 150,
        base: 200,
        slow: 300
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 100
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupScrollAnimations();
    setupInteractiveElements();
    setupCodeCopyFunctionality();
});

/**
 * Initialize all animations
 */
function initializeAnimations() {
    // Fade in hero content with stagger
    animateHeroContent();
    
    // Animate navigation on scroll
    setupNavigationAnimation();
    
    // Animate cards on scroll
    setupCardAnimations();
    
    // Animate pipeline steps
    animatePipelineSteps();
}

/**
 * Animate hero content with staggered entrance
 */
function animateHeroContent() {
    const heroElements = [
        '.hero-badge',
        '.hero-title',
        '.hero-description',
        '.hero-actions',
        '.hero-stats'
    ];
    
    heroElements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = `opacity ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}, transform ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * ANIMATION_CONFIG.stagger);
        }
    });
    
    // Animate hero visual separately
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            heroVisual.style.transition = `opacity ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}, transform ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}`;
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateX(0)';
        }, 400);
    }
}

/**
 * Setup navigation animation on scroll
 */
function setupNavigationAnimation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });
}

/**
 * Setup scroll-triggered animations
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.card, .stage, .feature-item, .section-header');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}, transform ${ANIMATION_CONFIG.duration.slow}ms ${ANIMATION_CONFIG.easing}`;
        observer.observe(el);
    });
}

/**
 * Setup card animations
 */
function setupCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        });
    });
}

/**
 * Animate pipeline steps
 */
function animatePipelineSteps() {
    const pipelineSteps = document.querySelectorAll('.pipeline-step');
    
    pipelineSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'scale(0.8)';
        step.style.transition = `opacity ${ANIMATION_CONFIG.duration.base}ms ${ANIMATION_CONFIG.easing}, transform ${ANIMATION_CONFIG.duration.base}ms ${ANIMATION_CONFIG.easing}`;
        
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'scale(1)';
        }, 600 + (index * 100));
    });
    
    // Animate arrows
    const arrows = document.querySelectorAll('.pipeline-arrow');
    arrows.forEach((arrow, index) => {
        arrow.style.opacity = '0';
        arrow.style.transform = 'translateX(-10px)';
        arrow.style.transition = `opacity ${ANIMATION_CONFIG.duration.base}ms ${ANIMATION_CONFIG.easing}, transform ${ANIMATION_CONFIG.duration.base}ms ${ANIMATION_CONFIG.easing}`;
        
        setTimeout(() => {
            arrow.style.opacity = '1';
            arrow.style.transform = 'translateX(0)';
        }, 800 + (index * 100));
    });
}

/**
 * Setup interactive elements
 */
function setupInteractiveElements() {
    // Button hover animations
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (button.classList.contains('btn-primary')) {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (button.classList.contains('btn-primary')) {
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }
        });
    });
    
    // Navigation link hover effects
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Setup code copy functionality
 */
function setupCodeCopyFunctionality() {
    const copyButtons = document.querySelectorAll('.code-copy');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const codeBlock = button.closest('.code-example').querySelector('code');
            if (codeBlock) {
                try {
                    await navigator.clipboard.writeText(codeBlock.textContent);
                    
                    // Visual feedback
                    const originalText = button.textContent;
                    button.textContent = 'Copied!';
                    button.style.background = 'var(--ict-green-secondary)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = 'var(--ict-green-primary)';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                }
            }
        });
    });
}

/**
 * Add animate-in class styles
 */
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .pipeline-step {
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .pipeline-step:hover {
        transform: scale(1.05);
    }
    
    .pipeline-step.active {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4);
        }
        50% {
            box-shadow: 0 0 0 10px rgba(0, 255, 136, 0);
        }
    }
    
    .gradient-text {
        background-size: 200% 200%;
        animation: gradientShift 3s ease infinite;
    }
    
    @keyframes gradientShift {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    
    .hero-stats > div {
        transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hero-stats > div:hover {
        transform: translateY(-2px);
    }
    
    .stage-icon {
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .stage:hover .stage-icon {
        transform: scale(1.1);
        background: var(--ict-green-primary);
        color: var(--color-white);
    }
`;
document.head.appendChild(style);

/**
 * Smooth scroll for navigation links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/**
 * Performance optimization: Throttle scroll events
 */
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    // Any additional scroll handling can go here
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);