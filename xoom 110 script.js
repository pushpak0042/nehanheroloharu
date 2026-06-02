document.addEventListener('DOMContentLoaded', function() {

    AOS.init({
        duration: 1000,
        once: true
    });

    /* =========================
       DROPDOWN MENU
    ========================== */

    const dropdownGroups = document.querySelectorAll('.has-dropdown');

    dropdownGroups.forEach(function(group) {

        const trigger = group.querySelector('a');

        if (!trigger) return;

        trigger.addEventListener('click', function(event) {

            event.preventDefault();

            const isOpen = group.classList.contains('open');

            dropdownGroups.forEach(function(otherGroup) {
                otherGroup.classList.remove('open');
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

    /* =========================
       COLOR SELECTOR
    ========================== */

    const bikeImg = document.getElementById('bike-render');
    const dots = document.querySelectorAll('.dot');
    const colorName = document.getElementById('color-name');

    const colorLabels = {

        'xoom red.png': 'Sports Red',

        'xoom black.png': 'Matte Black',

        'xoom blue.png': 'Electric Blue',

        'xoom white.png': 'Pearl White',

        'xoom matte grey.png': 'Matte Grey'

    };

    if (bikeImg && dots.length) {

        dots.forEach(dot => {

            dot.addEventListener('click', function() {

                dots.forEach(d => d.classList.remove('active'));

                this.classList.add('active');

                const newImg = this.getAttribute('data-img');

                const label = colorLabels[newImg] || 'Xoom 110';

                bikeImg.style.opacity = '0';

                bikeImg.style.transform = 'scale(0.96)';

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

    /* =========================
       HERO IMAGE SLIDER
    ========================== */

    const sliderImages = document.querySelectorAll('.slide');

    const sliderDots = document.querySelectorAll('.slider-dot');

    let sliderIndex = 0;

    function showSlide(index) {

        sliderImages.forEach((slide, slideIndex) => {

            slide.classList.toggle('active', slideIndex === index);

        });

        sliderDots.forEach((dot, dotIndex) => {

            dot.classList.toggle('active', dotIndex === index);

        });

    }

    if (sliderImages.length && sliderDots.length) {

        sliderDots.forEach((dot, dotIndex) => {

            dot.addEventListener('click', function() {

                sliderIndex = dotIndex;

                showSlide(sliderIndex);

            });

            dot.addEventListener('keydown', function(event) {

                if (event.key === 'Enter' || event.key === ' ') {

                    sliderIndex = dotIndex;

                    showSlide(sliderIndex);

                }

            });

        });

        setInterval(function() {

            sliderIndex = (sliderIndex + 1) % sliderImages.length;

            showSlide(sliderIndex);

        }, 2500);

    }

    /* =========================
       IMAGE HOVER EFFECT
    ========================== */

    if (bikeImg) {

        bikeImg.addEventListener('mouseenter', function() {

            bikeImg.style.transform = 'scale(1.03)';

        });

        bikeImg.addEventListener('mouseleave', function() {

            bikeImg.style.transform = 'scale(1)';

        });

    }

});