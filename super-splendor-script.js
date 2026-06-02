// Initialize Animations
AOS.init({ duration: 1000, once: true });

// Color Switcher Logic
const bikeImg = document.getElementById('bike-render');
const dots = document.querySelectorAll('.dot');
const colorNameText = document.getElementById('color-name');

// Map of colors
const colorMap = {
    "red": "Candy Blazing Red",
    "black-silver": "Black with Silver",
    "blue": "Metallic Blue",
    "black-grey": "Black with Grey"
};

dots.forEach(dot => {
    dot.addEventListener('click', function() {
        // Active UI change
        dots.forEach(d => d.classList.remove('active'));
        this.classList.add('active');

        // Data fetch
        const newSrc = this.getAttribute('data-img');
        const colorKey = this.getAttribute('data-color');

        // Transition Animation
        bikeImg.style.opacity = '0';
        bikeImg.style.transform = 'scale(0.95)';

        setTimeout(() => {
            bikeImg.src = newSrc;
            colorNameText.innerText = colorMap[colorKey];
            bikeImg.style.opacity = '1';
            bikeImg.style.transform = 'scale(1)';
        }, 300);
    });
});