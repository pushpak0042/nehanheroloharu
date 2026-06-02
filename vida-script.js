document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // 2. Interactive Color Selector Logic
    const colorDots = document.querySelectorAll('.dot');
    const bikeImage = document.getElementById('bike-render');
    const colorNameText = document.getElementById('color-name');

    if (!bikeImage || colorDots.length === 0) return;

    // Dictionary mapping data-color values to actual display names
    const colorNames = {
        'white': 'Matte White',
        'red': 'Cruiser Red',
        'black': 'Abyss Black',
        'orange': 'Vida Orange'
    };

    colorDots.forEach(dot => {
        dot.addEventListener('click', function() {
            // Remove 'active' class from all dots
            colorDots.forEach(d => d.classList.remove('active'));
            
            // Add 'active' class to the clicked dot
            this.classList.add('active');
            
            // Fetch the image source and color key from data attributes
            const newImgSrc = this.getAttribute('data-img');
            const colorKey = this.getAttribute('data-color');
            
            // Only update image if a valid source is provided
            if (newImgSrc) {
                bikeImage.style.opacity = '0.3';
                setTimeout(() => {
                    bikeImage.src = newImgSrc;
                    bikeImage.style.opacity = '1';
                }, 200);
            }
            
            // Update the text displaying the color name
            if (colorNameText) {
                colorNameText.textContent = colorNames[colorKey] || colorKey;
            }
        });
    });
});