document.addEventListener('DOMContentLoaded', function() {
    AOS.init({ duration: 1000, once: true });

    const dropdownGroups = document.querySelectorAll('.has-dropdown');
    dropdownGroups.forEach(function(group) {
        const trigger = group.querySelector('a');
        if (!trigger) return;

        trigger.addEventListener('click', function(event) {
            event.preventDefault();
            const isOpen = group.classList.contains('open');
            dropdownGroups.forEach(function(other) {
                other.classList.remove('open');
            });
            if (!isOpen) {
                group.classList.add('open');
            }
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.has-dropdown')) {
            dropdownGroups.forEach(function(group) {
                group.classList.remove('open');
            });
        }
    });

    const bikeImg = document.getElementById('bike-render');
    const dots = document.querySelectorAll('.dot');
    const colorName = document.getElementById('color-name');
    const colorLabels = {
        'destini 110 vx white.png': 'Pearl White',
        'destini vx black.png': 'Midnight Black',
        'destini zx red.png': 'Racing Red',
        'destini zx light shade.png': 'Light Shade',
        'destini zx blue.png': 'Ocean Blue'
    };

    if (bikeImg && dots.length) {
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                dots.forEach(d => d.classList.remove('active'));
                this.classList.add('active');

                const newImg = this.getAttribute('data-img');
                const label = colorLabels[newImg] || 'Destini Color';

                bikeImg.style.opacity = '0';
                bikeImg.style.transform = 'scale(0.98)';

                setTimeout(() => {
                    bikeImg.src = newImg;
                    bikeImg.alt = label;
                    colorName.innerText = label;
                    bikeImg.style.opacity = '1';
                    bikeImg.style.transform = 'scale(1)';
                }, 250);
            });
        });
    }

    const sliderImages = document.querySelectorAll('.slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    let sliderIndex = 0;

    const showSlide = (index) => {
        sliderImages.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
        });
        sliderDots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    };

    if (sliderImages.length && sliderDots.length) {
        sliderDots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => {
                sliderIndex = dotIndex;
                showSlide(sliderIndex);
            });

            dot.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    sliderIndex = dotIndex;
                    showSlide(sliderIndex);
                }
            });
        });

        setInterval(() => {
            sliderIndex = (sliderIndex + 1) % sliderImages.length;
            showSlide(sliderIndex);
        }, 2000);
    }
});