document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true, // Whether animation should happen only once - while scrolling down
        offset: 100 // Offset (in px) from the original trigger point
    });

    // 2. Interactive Color Selector Logic
    const colorDots = document.querySelectorAll('.dot');
    const bikeImage = document.getElementById('bike-render');
    const colorNameText = document.getElementById('color-name');

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
            
            // Smooth fade effect for changing the image
            bikeImage.style.opacity = '0.3';
            
            setTimeout(() => {
                bikeImage.src = newImgSrc;
                bikeImage.style.opacity = '1';
            }, 200); // 200ms matches the CSS transition speed
            
            // Update the text displaying the color name
            colorNameText.textContent = colorNames[colorKey] || colorKey;
        });
    });
});