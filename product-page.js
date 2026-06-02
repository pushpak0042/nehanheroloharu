document.addEventListener("DOMContentLoaded", function () {
    initSubMenu();
    initVariantPreview();
});

function initSubMenu() {
    var toggle = document.getElementById("subMenuToggle");
    var nav = document.getElementById("subNav");
    var backdrop = document.getElementById("subMenuBackdrop");

    if (!toggle || !nav || !backdrop) {
        return;
    }

    function isMobile() {
        return window.innerWidth <= 980;
    }

    function closeMenu() {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        backdrop.hidden = true;
        document.body.style.overflow = "";
    }

    function openMenu() {
        nav.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        backdrop.hidden = false;
        document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", function () {
        var shouldOpen = !nav.classList.contains("is-open");
        if (shouldOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    backdrop.addEventListener("click", closeMenu);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i += 1) {
        links[i].addEventListener("click", function () {
            if (isMobile()) {
                closeMenu();
            }
        });
    }

    window.addEventListener("resize", function () {
        if (!isMobile()) {
            closeMenu();
        }
    });
}

function initVariantPreview() {
    var image = document.getElementById("productMainImage");
    var buttons = document.querySelectorAll(".variant-btn[data-image]");

    if (!image || !buttons.length) {
        return;
    }

    function activate(button) {
        var nextImage = button.getAttribute("data-image");
        if (!nextImage) {
            return;
        }

        for (var i = 0; i < buttons.length; i += 1) {
            buttons[i].classList.remove("is-active");
            buttons[i].setAttribute("aria-pressed", "false");
        }

        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");
        image.style.opacity = "0.15";

        setTimeout(function () {
            image.src = nextImage;
            image.style.opacity = "1";
        }, 120);
    }

    for (var i = 0; i < buttons.length; i += 1) {
        buttons[i].addEventListener("click", (function (btn) {
            return function () {
                activate(btn);
            };
        })(buttons[i]));
    }
}
