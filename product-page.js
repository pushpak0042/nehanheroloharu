document.addEventListener("DOMContentLoaded", function () {
    initSubMenu();
    initVariantPreview();
});

function initSubMenu() {
    var toggle = document.getElementById("subMenuToggle");
    var nav = document.getElementById("subNav");
    var backdrop = document.getElementById("subMenuBackdrop");
    var lastTouchToggle = 0;

    if (!toggle || !nav || !backdrop) {
        return;
    }

    if (nav.getAttribute("data-menu-ready") === "true") {
        return;
    }
    nav.setAttribute("data-menu-ready", "true");

    function hasClass(element, className) {
        return element && (" " + element.className + " ").indexOf(" " + className + " ") !== -1;
    }

    function addClass(element, className) {
        if (element && !hasClass(element, className)) {
            element.className = element.className ? element.className + " " + className : className;
        }
    }

    function removeClass(element, className) {
        if (!element) {
            return;
        }
        element.className = (" " + element.className + " ").replace(" " + className + " ", " ").replace(/^\s+|\s+$/g, "");
    }

    function isMobile() {
        return window.innerWidth <= 980;
    }

    function setMenuOpen(isOpen) {
        if (isOpen) {
            addClass(nav, "is-open");
            addClass(toggle, "is-active");
            nav.setAttribute("data-open", "true");
            toggle.setAttribute("aria-expanded", "true");
            backdrop.hidden = false;
            document.body.style.overflow = "hidden";
        } else {
            removeClass(nav, "is-open");
            removeClass(toggle, "is-active");
            nav.setAttribute("data-open", "false");
            toggle.setAttribute("aria-expanded", "false");
            backdrop.hidden = true;
            document.body.style.overflow = "";
        }
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleToggle(event) {
        if (event && event.type === "click" && Date.now() - lastTouchToggle < 450) {
            return;
        }
        if (event && event.type === "touchstart") {
            lastTouchToggle = Date.now();
        }
        if (event && event.preventDefault) event.preventDefault();
        if (event && event.stopPropagation) event.stopPropagation();

        setMenuOpen(!hasClass(nav, "is-open"));
    }

    toggle.addEventListener("click", handleToggle);
    toggle.addEventListener("touchstart", handleToggle, false);

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
