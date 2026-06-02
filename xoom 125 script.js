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

    // Dictionary mapping data-color values to actual display names for Xoom 125
    const colorNames = {
        'blue': 'Cobalt Blue',
        'black': 'Panther Black',
        'white': 'Pearl Silver White',
        'red': 'Sports Red'
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
                // Fade out effect
                bikeImage.style.opacity = '0.3';
                
                // Swap image and fade back in after a short delay
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