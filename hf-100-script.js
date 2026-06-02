// Initialize Scroll Animations
AOS.init({ duration: 1000, once: true });

// --- Color Switcher Logic ---
const bikeImg = document.getElementById('bike-render');
const dots = document.querySelectorAll('.dot');
const colorName = document.getElementById('color-name');

// Dictionary mapping the data-color attribute to readable names for HF 100
const colorLabels = {
    "black-red": "Black with Red Theme",
    "nexus-blue": "Nexus Blue"
};

dots.forEach(dot => {
    dot.addEventListener('click', function() {
        // 1. Update active UI styling
        dots.forEach(d => d.classList.remove('active'));
        this.classList.add('active');

        // 2. Fetch new image and text data
        const newImg = this.getAttribute('data-img');
        const colorKey = this.getAttribute('data-color');
        
        // 3. Fade out the current image
        bikeImg.style.opacity = '0';
        bikeImg.style.transform = 'scale(0.95)';
        
        // 4. Swap image and fade back in
        setTimeout(() => {
            bikeImg.src = newImg;
            colorName.innerText = colorLabels[colorKey];
            
            bikeImg.style.opacity = '1';
            bikeImg.style.transform = 'scale(1)';
        }, 300); // 300ms matches the CSS transition time
    });
});