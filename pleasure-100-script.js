// Pleasure+ 100 Specific JavaScript - Inspired by HF 100

// Initialize Scroll Animations
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Color Switcher Logic for Pleasure+ 100
const scooterImg = document.getElementById('main-scooter-img');
const colorBtns = document.querySelectorAll('.color-btn');

// Color labels for Pleasure+ 100
const colorLabels = {
    "pleasure vx blue.png": "Polestar Blue",
    "pleasure zx grey.png": "Matt Vernier Grey",
    "pleasure red vx.png": "Sporty Red"
};

colorBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // 1. Update active UI styling
        colorBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 2. Get the new image from data-image attribute
        const newImg = this.getAttribute('data-image');

        // 3. Fade out the current image with smooth transition
        scooterImg.style.opacity = '0';
        scooterImg.style.transform = 'scale(0.95)';

        // 4. Swap image and fade back in
        setTimeout(() => {
            scooterImg.src = newImg;
            scooterImg.alt = colorLabels[newImg] || 'Hero Pleasure+ Scooter';

            scooterImg.style.opacity = '1';
            scooterImg.style.transform = 'scale(1)';
        }, 300); // 300ms matches the CSS transition time
    });
});

// Smooth scrolling for navigation (if needed)
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

// Add loading animation for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease-in-out';
    });
});

// Video play/pause functionality enhancement
const video = document.querySelector('.commercial-video video');
if (video) {
    video.addEventListener('play', function() {
        console.log('Pleasure+ commercial video started');
    });

    video.addEventListener('pause', function() {
        console.log('Pleasure+ commercial video paused');
    });
}

// Intersection Observer for animations (additional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.spec-item, .feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Buy Now button click tracking
document.querySelectorAll('.buy-now-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        console.log('Buy Now clicked for Pleasure+ 100');
        // Add analytics tracking here if needed
    });
});
