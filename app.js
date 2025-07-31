// Modern Presentation Controller for GitHub Copilot AI Presentation

class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.slides = [];
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.inactivityTimer = null;
        this.autoHideDelay = 3000; // 3 seconds
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.updateSlideCounter();
        this.updateProgressBar();
        this.setupAutoHide();
        
        console.log('GitHub Copilot Presentation initialized successfully');
        console.log(`Total slides: ${this.totalSlides}`);
    }

    setupElements() {
        // Get all slides
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        
        // Get control elements
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.slideCounter = document.getElementById('slideCounter');
        this.navControls = document.querySelector('.nav-controls');
        
        // Set initial states
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        // Navigation button events - Fixed event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.previousSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch/swipe navigation
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Mouse activity for auto-hide
        document.addEventListener('mousemove', () => this.handleUserActivity());
        document.addEventListener('click', () => this.handleUserActivity());
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent context menu on touch devices
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyPress(event) {
        // Don't interfere with form inputs
        if (event.target.matches('input, textarea, select')) {
            return;
        }

        const key = event.key.toLowerCase();
        
        switch (key) {
            case 'arrowright':
            case 'arrowdown':
            case ' ': // Spacebar
            case 'pagedown':
                event.preventDefault();
                this.nextSlide();
                break;
                
            case 'arrowleft':
            case 'arrowup':
            case 'pageup':
                event.preventDefault();
                this.previousSlide();
                break;
                
            case 'home':
                event.preventDefault();
                this.goToSlide(0);
                break;
                
            case 'end':
                event.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
                
            case 'f':
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
                
            case 'escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
                
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.resetPresentation();
                }
                break;
        }
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
        this.touchStartTime = Date.now();
    }

    handleTouchEnd(event) {
        if (!this.touchStartX || !this.touchStartY) {
            return;
        }

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const deltaX = this.touchStartX - touchEndX;
        const deltaY = this.touchStartY - touchEndY;
        const deltaTime = touchEndTime - this.touchStartTime;
        
        // Only handle quick swipes (< 300ms) with significant movement
        if (deltaTime > 300 || Math.abs(deltaX) < 50) {
            return;
        }
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
        }
        
        // Reset touch coordinates
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    handleUserActivity() {
        // Show navigation controls
        this.showNavigation();
        
        // Reset auto-hide timer
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.hideNavigation();
        }, this.autoHideDelay);
    }

    setupAutoHide() {
        // Initially show navigation
        this.showNavigation();
        
        // Set initial auto-hide timer
        this.inactivityTimer = setTimeout(() => {
            this.hideNavigation();
        }, this.autoHideDelay);
    }

    showNavigation() {
        if (this.navControls) {
            this.navControls.style.opacity = '1';
            this.navControls.style.pointerEvents = 'auto';
        }
        
        const slideCounter = document.querySelector('.slide-counter');
        if (slideCounter) {
            slideCounter.style.opacity = '1';
        }
    }

    hideNavigation() {
        if (this.navControls) {
            this.navControls.style.opacity = '0.3';
            this.navControls.style.pointerEvents = 'auto'; // Keep functional but less visible
        }
        
        const slideCounter = document.querySelector('.slide-counter');
        if (slideCounter) {
            slideCounter.style.opacity = '0.7';
        }
    }

    nextSlide() {
        if (this.isTransitioning || this.currentSlide >= this.totalSlides - 1) {
            return;
        }
        
        console.log(`Moving from slide ${this.currentSlide + 1} to ${this.currentSlide + 2}`);
        this.goToSlide(this.currentSlide + 1);
    }

    previousSlide() {
        if (this.isTransitioning || this.currentSlide <= 0) {
            return;
        }
        
        console.log(`Moving from slide ${this.currentSlide + 1} to ${this.currentSlide}`);
        this.goToSlide(this.currentSlide - 1);
    }

    goToSlide(slideIndex) {
        if (this.isTransitioning || slideIndex < 0 || slideIndex >= this.totalSlides || slideIndex === this.currentSlide) {
            return;
        }

        console.log(`Transitioning to slide ${slideIndex + 1}`);
        this.isTransitioning = true;
        
        // Remove active class from current slide
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.remove('active');
        }
        
        // Add prev class if moving backwards, remove it if moving forwards
        if (slideIndex < this.currentSlide) {
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.add('prev');
            }
        } else {
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.remove('prev');
            }
        }
        
        // Update current slide
        const previousSlideIndex = this.currentSlide;
        this.currentSlide = slideIndex;
        
        // Add active class to new slide
        setTimeout(() => {
            if (this.slides[this.currentSlide]) {
                this.slides[this.currentSlide].classList.add('active');
                this.slides[this.currentSlide].classList.remove('prev');
            }
            
            // Clean up previous slide classes
            if (this.slides[previousSlideIndex]) {
                this.slides[previousSlideIndex].classList.remove('prev');
            }
            
            this.updateUI();
            
            // Re-enable transitions after animation completes
            setTimeout(() => {
                this.isTransitioning = false;
            }, 600); // Match CSS transition duration
            
        }, 50);
    }

    updateUI() {
        this.updateSlideCounter();
        this.updateProgressBar();
        this.updateNavigationButtons();
        this.updateDocumentTitle();
        this.announceSlideChange();
    }

    updateSlideCounter() {
        if (this.slideCounter) {
            this.slideCounter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
        }
    }

    updateProgressBar() {
        if (this.progressBar) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }

    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 0;
            this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
            this.nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1';
        }
    }

    updateDocumentTitle() {
        const currentSlideElement = this.slides[this.currentSlide];
        const slideTitle = this.getSlideTitle(currentSlideElement);
        document.title = `${slideTitle} - AI Language Models & GitHub Copilot (${this.currentSlide + 1}/${this.totalSlides})`;
    }

    getSlideTitle(slideElement) {
        if (!slideElement) return `Slide ${this.currentSlide + 1}`;
        
        const h1 = slideElement.querySelector('h1');
        if (h1) return h1.textContent.trim();
        
        const h2 = slideElement.querySelector('h2');
        if (h2) return h2.textContent.trim();
        
        return `Slide ${this.currentSlide + 1}`;
    }

    announceSlideChange() {
        // Announce slide changes to screen readers
        const slideTitle = this.getSlideTitle(this.slides[this.currentSlide]);
        this.announceToScreenReader(`Slide ${this.currentSlide + 1} of ${this.totalSlides}: ${slideTitle}`);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    resetPresentation() {
        this.goToSlide(0);
        console.log('Presentation reset to first slide');
    }

    handleResize() {
        // Handle responsive adjustments if needed
        this.updateUI();
    }

    // Public API methods
    getCurrentSlideInfo() {
        const slideElement = this.slides[this.currentSlide];
        return {
            current: this.currentSlide + 1,
            total: this.totalSlides,
            title: this.getSlideTitle(slideElement),
            element: slideElement
        };
    }

    exportSlideData() {
        const slideData = Array.from(this.slides).map((slide, index) => ({
            number: index + 1,
            title: this.getSlideTitle(slide),
            content: slide.textContent.trim().substring(0, 200) + '...'
        }));
        
        const data = {
            title: 'AI Language Models & GitHub Copilot Best Practices',
            timestamp: new Date().toISOString(),
            totalSlides: this.totalSlides,
            currentSlide: this.currentSlide + 1,
            slides: slideData
        };
        
        console.log('Presentation Data:', data);
        return data;
    }

    // Utility methods
    printPresentation() {
        window.print();
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global presentation controller
    window.presentationController = new PresentationController();
    
    // Add utility methods to window for console access
    window.PresentationUtils = {
        goToSlide: (slideNumber) => {
            return window.presentationController.goToSlide(slideNumber - 1);
        },
        getCurrentSlideInfo: () => {
            return window.presentationController.getCurrentSlideInfo();
        },
        resetPresentation: () => {
            window.presentationController.resetPresentation();
        },
        exportSlideData: () => {
            return window.presentationController.exportSlideData();
        },
        toggleFullscreen: () => {
            window.presentationController.toggleFullscreen();
        },
        printPresentation: () => {
            window.presentationController.printPresentation();
        }
    };
    
    // Add additional keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.target.matches('input, textarea, select')) return;
        
        const key = event.key.toLowerCase();
        
        // Number keys for direct slide navigation
        if (key >= '1' && key <= '9') {
            const slideNumber = parseInt(key) - 1;
            if (slideNumber < window.presentationController.totalSlides) {
                event.preventDefault();
                window.presentationController.goToSlide(slideNumber);
            }
        }
        
        // Print shortcut
        if (key === 'p' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            window.presentationController.printPresentation();
        }
    });
    
    // Add fullscreen change handler
    document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
            console.log('Entered fullscreen mode');
            document.body.classList.add('fullscreen-mode');
        } else {
            console.log('Exited fullscreen mode');
            document.body.classList.remove('fullscreen-mode');
        }
    });
    
    // Add print media styles
    const printStyles = `
        @media print {
            .nav-controls,
            .progress-container,
            .slide-counter {
                display: none !important;
            }
            
            .slide {
                position: static !important;
                opacity: 1 !important;
                transform: none !important;
                page-break-after: always;
                height: auto !important;
                padding: 1in !important;
            }
            
            .slide-content {
                max-height: none !important;
                overflow: visible !important;
                box-shadow: none !important;
                border: 1px solid #000 !important;
            }
            
            body {
                overflow: visible !important;
            }
            
            .presentation-container {
                height: auto !important;
            }
            
            .slides-wrapper {
                overflow: visible !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    // Add performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
                    console.log(`Presentation loaded in: ${loadTime}ms`);
                    
                    const metrics = {
                        loadTime: loadTime,
                        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                        totalSlides: window.presentationController.totalSlides,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('Performance Metrics:', metrics);
                }
            }, 100);
        });
    }
    
    // Add error handling
    window.addEventListener('error', function(event) {
        console.error('Presentation Error:', event.error);
        
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--color-error);
                color: var(--color-white);
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            ">
                <strong>Presentation Error:</strong><br>
                ${event.error?.message || 'An unexpected error occurred'}
            </div>
        `;
        
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            if (document.body.contains(errorMessage)) {
                document.body.removeChild(errorMessage);
            }
        }, 5000);
    });
    
    // Add fullscreen mode styles
    const fullscreenStyles = `
        .fullscreen-mode .nav-controls {
            opacity: 0.2;
            transition: opacity 0.3s ease;
        }
        
        .fullscreen-mode .nav-controls:hover {
            opacity: 1;
        }
        
        .fullscreen-mode .slide-counter {
            opacity: 0.7;
        }
    `;
    
    const fullscreenStyleSheet = document.createElement('style');
    fullscreenStyleSheet.textContent = fullscreenStyles;
    document.head.appendChild(fullscreenStyleSheet);
    
    console.log('GitHub Copilot AI Presentation script loaded successfully');
    console.log('Available commands:');
    console.log('- Arrow keys: Navigate slides');
    console.log('- F: Toggle fullscreen');
    console.log('- Home/End: Go to first/last slide');
    console.log('- 1-9: Go to specific slide');
    console.log('- Ctrl+P: Print presentation');
    console.log('- Ctrl+R: Reset to first slide');
    console.log('- Use PresentationUtils object for programmatic control');
});