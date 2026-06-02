// Karizma XMR page interactions

document.addEventListener("DOMContentLoaded", () => {
    if (window.AOS) {
        AOS.init({
            duration: 900,
            once: true,
            offset: 80
        });
    }

    const heroBike = document.getElementById("bike-render");
    const previewBike = document.getElementById("bike-image");
    const dots = document.querySelectorAll(".dot");
    const colorName = document.getElementById("color-name");
    const variantSelect = document.getElementById("variant-select");
    const priceTag = document.querySelector(".price-tag");
    const heroSection = document.querySelector(".hero-section");
    const header = document.querySelector(".main-header");

    const glows = {
        grey: "rgba(255,255,255,0.22)",
        red: "rgba(237,28,36,0.45)",
        yellow: "rgba(255,196,0,0.45)",
        black: "rgba(255,255,255,0.16)"
    };

    function updateBikeImage(img, name, color) {
        [heroBike, previewBike].forEach((bike) => {
            if (!bike || !img) return;

            bike.style.opacity = "0";
            bike.style.transform = "translateY(16px) scale(0.96)";

            setTimeout(() => {
                bike.src = img;
                bike.alt = `Karizma XMR ${name || "bike"}`;
                bike.style.opacity = "1";
                bike.style.transform = "translateY(0) scale(1)";
                bike.style.filter = `drop-shadow(0 22px 40px ${glows[color] || glows.grey})`;
            }, 180);
        });

        if (colorName && name) {
            colorName.innerText = name;
        }
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            dots.forEach((item) => item.classList.remove("active"));
            dot.classList.add("active");
            updateBikeImage(dot.dataset.img, dot.dataset.name, dot.dataset.color);
        });
    });

    if (variantSelect && priceTag) {
        variantSelect.addEventListener("change", () => {
            const selectedOption = variantSelect.options[variantSelect.selectedIndex];
            const isCombat = selectedOption.text.includes("Combat");

            priceTag.innerText = isCombat
                ? "Starting at ₹1,86,000*"
                : "Starting at ₹1,84,000*";

            showNotification(isCombat ? "Combat Edition Selected" : "Standard Variant Selected");
        });
    }

    window.addEventListener("scroll", () => {
        if (header) {
            const scrolled = window.scrollY > 80;
            header.style.boxShadow = scrolled ? "0 10px 30px rgba(0,0,0,0.2)" : "";
        }

        if (heroSection) {
            heroSection.style.backgroundPositionY = `${window.scrollY * 0.18}px`;
        }
    });

    document.querySelectorAll(".btn-primary, .btn-red-small, .btn-buy-large").forEach((button) => {
        button.addEventListener("mousemove", (event) => {
            const rect = button.getBoundingClientRect();
            button.style.setProperty("--x", `${event.clientX - rect.left}px`);
            button.style.setProperty("--y", `${event.clientY - rect.top}px`);
        });
    });

    if (heroBike) {
        heroBike.addEventListener("mousemove", (event) => {
            const rect = heroBike.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * -10;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
            heroBike.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        });

        heroBike.addEventListener("mouseleave", () => {
            heroBike.style.transform = "";
        });
    }

    document.querySelectorAll(".gallery-grid img").forEach((image) => {
        image.addEventListener("click", () => {
            const overlay = document.createElement("div");
            overlay.className = "image-preview-overlay";
            overlay.innerHTML = `
                <button class="close-preview" type="button" aria-label="Close preview">×</button>
                <img src="${image.src}" alt="Karizma XMR preview">
            `;
            document.body.appendChild(overlay);

            overlay.addEventListener("click", () => overlay.remove());
        });
    });

    document.body.classList.add("loaded");
});

function showNotification(message) {
    const notify = document.createElement("div");
    notify.className = "premium-toast";
    notify.innerText = message;
    document.body.appendChild(notify);

    setTimeout(() => notify.classList.add("show"), 50);
    setTimeout(() => {
        notify.classList.remove("show");
        setTimeout(() => notify.remove(), 300);
    }, 2200);
}
