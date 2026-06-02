document.addEventListener('DOMContentLoaded', function () {
    const bike = document.getElementById('bike-render');
    const dots = document.querySelectorAll('.color-selector .dot');
    const colorName = document.getElementById('color-name');
    const variantSelect = document.getElementById('variant-select');
    const priceTag = document.querySelector('.price-tag');

    // Track the currently selected color image (for standard variant)
    let currentColorImg = bike.getAttribute('src') || '';

    // Initialize dots click
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const img = dot.getAttribute('data-img');
            const color = dot.getAttribute('data-color');
            currentColorImg = img;
            // update color name (make friendly for rally)
            if (color === 'rally') colorName.textContent = 'Rally Grey / Matte Blue';
            else colorName.textContent = color.charAt(0).toUpperCase() + color.slice(1);

            // Only change bike image if not showing Dakar variant
            if (variantSelect && variantSelect.value !== 'dakar') {
                bike.setAttribute('src', img);
            }
        });
    });

    // Variant selector change
    if (variantSelect) {
        variantSelect.addEventListener('change', () => {
            const selected = variantSelect.options[variantSelect.selectedIndex];
            const price = selected.getAttribute('data-price') || '₹1,75,000';
            const variantImg = selected.getAttribute('data-img');

            // Update price displayed in header
            if (priceTag) priceTag.textContent = price;

            // If variant has its own image, show it; otherwise show current color image
            if (variantImg) {
                bike.setAttribute('src', variantImg);
            } else {
                bike.setAttribute('src', currentColorImg);
            }
        });
    }

    // Ensure AOS initialization if used elsewhere
    if (window.AOS) window.AOS.init();
});