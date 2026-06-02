document.addEventListener('DOMContentLoaded', function() {
    const variantSelect = document.getElementById('variant-select');
    const priceTag = document.querySelector('.price-tag');
    const bikeRender = document.getElementById('bike-render');
    const colorName = document.getElementById('color-name');
    const colorDots = Array.from(document.querySelectorAll('.dot[data-img]'));
    const buyLinks = Array.from(document.querySelectorAll('a[href^="booking.html"], a.btn-buy-large'));

    if (!bikeRender && !variantSelect && colorDots.length === 0) {
        return;
    }

    const variantLabels = {
        kick: 'Kick Start',
        self: 'Self Start',
        standard: 'Standard',
        'black-edition': 'Black Edition'
    };

    const variantColorMapping = {
        'black-edition': ['black', 'black-red', 'red black']
    };

    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    const parseMoney = (value) => {
        if (!value) return 0;
        const parsed = String(value).replace(/[^\d]/g, '');
        return parsed ? parseInt(parsed, 10) : 0;
    };

    const getModelName = () => {
        const explicit = document.body.getAttribute('data-product-name');
        const modelName = document.querySelector('.model-name');
        const heading = document.querySelector('h1');
        return (explicit || modelName?.textContent || heading?.textContent || document.title || 'Vehicle')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getSelectedOption = () => {
        if (!variantSelect) return null;
        return variantSelect.options[variantSelect.selectedIndex] || null;
    };

    const getVariantLabel = () => {
        const option = getSelectedOption();
        if (!option) return '';
        return (option.textContent || variantLabels[option.value] || option.value)
            .replace(/\s*[-—]\s*₹.+$/, '')
            .trim();
    };

    const formatColorName = (value) => {
        if (!value) return '';
        return String(value)
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, letter => letter.toUpperCase());
    };

    const getVehiclePrice = () => {
        const option = getSelectedOption();
        return parseMoney(option?.getAttribute('data-price')) ||
            parseMoney(priceTag?.textContent) ||
            parseMoney(document.querySelector('.slider-price strong')?.textContent);
    };

    const getBookingAmount = () => {
        const option = getSelectedOption();
        const explicit = option?.getAttribute('data-booking') ||
            option?.getAttribute('data-booking-amount') ||
            document.body.getAttribute('data-booking') ||
            document.body.getAttribute('data-booking-amount');

        if (explicit) return parseMoney(explicit);

        const vehiclePrice = getVehiclePrice();
        if (!vehiclePrice) return 5000;

        // Advance amount follows the selected variant price, rounded to the nearest hundred.
        return Math.max(1000, Math.round((vehiclePrice * 0.10) / 100) * 100);
    };

    const getPermanentFee = () => 0;

    const setBikeImage = (imgSrc) => {
        if (!bikeRender || !imgSrc) return;
        bikeRender.style.opacity = '0';
        setTimeout(() => {
            bikeRender.src = imgSrc;
            bikeRender.style.opacity = '1';
        }, 160);
    };

    const getActiveDot = () => colorDots.find(dot => dot.classList.contains('active')) || colorDots[0] || null;

    const setActiveDot = (dot, shouldUpdateImage = true) => {
        if (!dot) return;
        colorDots.forEach((item) => item.classList.remove('active'));
        dot.classList.add('active');

        if (colorName) {
            colorName.textContent = dot.getAttribute('data-label') ||
                dot.getAttribute('aria-label') ||
                formatColorName(dot.getAttribute('data-color')) ||
                '';
        }

        if (shouldUpdateImage) {
            setBikeImage(dot.getAttribute('data-img'));
        }

        updateBookingLinks();
    };

    const filterColorDots = (allowedColors) => {
        colorDots.forEach((dot) => {
            const color = dot.getAttribute('data-color');
            const isAllowed = !allowedColors || allowedColors.includes(color);
            dot.style.display = isAllowed ? 'inline-flex' : 'none';
        });
    };

    const selectVariantColor = (option) => {
        const variantValue = option?.value;
        const optionColors = option?.getAttribute('data-colors');
        const allowedColors = optionColors ? optionColors.split(',').map(color => color.trim()) : variantColorMapping[variantValue];
        filterColorDots(allowedColors);

        const optionImg = option?.getAttribute('data-img');
        const preferredColor = option?.getAttribute('data-color');
        const visibleDots = colorDots.filter(dot => dot.style.display !== 'none');
        const matchingDot = visibleDots.find(dot => dot.getAttribute('data-color') === preferredColor);
        const variantIndexDot = variantSelect ? visibleDots[variantSelect.selectedIndex % Math.max(visibleDots.length, 1)] : null;
        const activeDot = getActiveDot();
        const nextDot = matchingDot || (optionImg ? activeDot : variantIndexDot) || (activeDot && activeDot.style.display !== 'none' ? activeDot : visibleDots[0]);

        if (nextDot) {
            setActiveDot(nextDot, !optionImg);
        }

        if (optionImg) {
            setBikeImage(optionImg);
        }
    };

    const updateVariantSelection = () => {
        const option = getSelectedOption();

        if (option && priceTag) {
            const newPrice = option.getAttribute('data-price');
            if (newPrice) priceTag.textContent = newPrice;
        }

        if (option) {
            selectVariantColor(option);
        }

        updateBookingLinks();
    };

    function updateBookingLinks() {
        const activeDot = getActiveDot();
        const product = getModelName();
        const variant = getVariantLabel();
        const color = activeDot?.getAttribute('data-label') ||
            activeDot?.getAttribute('aria-label') ||
            formatColorName(activeDot?.getAttribute('data-color')) ||
            colorName?.textContent ||
            '';
        const fee = getPermanentFee();
        const image = activeDot?.getAttribute('data-img') || bikeRender?.getAttribute('src') || '';

        buyLinks.forEach((link) => {
            if (!link.classList.contains('btn-buy-large') && !link.getAttribute('href')?.startsWith('booking.html')) {
                return;
            }

            const params = new URLSearchParams({
                product,
                type: 'vehicle'
            });

            if (fee > 0) params.set('fee', String(fee));
            if (variant) params.set('variant', variant);
            if (color) params.set('color', color);
            if (image) params.set('image', image);

            link.href = `booking.html?${params.toString()}`;
            if (/buy now|book now/i.test(link.textContent.trim())) {
                link.textContent = 'BOOK NOW';
            }
        });
    }

    colorDots.forEach((dot) => {
        dot.addEventListener('click', () => setActiveDot(dot));
    });

    if (variantSelect) {
        variantSelect.addEventListener('change', updateVariantSelection);
    }

    updateVariantSelection();
    if (!variantSelect && getActiveDot()) {
        setActiveDot(getActiveDot(), false);
    }
});
