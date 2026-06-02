/* Mobile navigation fallback for older/strict mobile browsers */
(function () {
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    function hasClass(el, className) {
        if (!el || !el.className) return false;
        return (" " + el.className + " ").indexOf(" " + className + " ") !== -1;
    }

    function addClass(el, className) {
        if (!el || hasClass(el, className)) return;
        el.className = el.className ? (el.className + " " + className) : className;
    }

    function removeClass(el, className) {
        if (!el || !el.className) return;
        var classes = (" " + el.className + " ").replace(" " + className + " ", " ");
        el.className = classes.replace(/^\s+|\s+$/g, "");
    }

    function q(selector, root) {
        return (root || document).querySelector(selector);
    }

    function findClosest(node, tagName) {
        var current = node;
        var upperTag = String(tagName || "").toUpperCase();
        while (current && current !== document) {
            if (current.tagName && current.tagName.toUpperCase() === upperTag) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    function ensureHeader() {
        var existing = q(".main-header, .navbar, .hm-generated-header");
        if (existing) return existing;
        if (!document.body) return null;

        document.body.insertAdjacentHTML("afterbegin",
            '<header class="hm-generated-header">' +
                '<div class="nav-container">' +
                    '<a href="index.html" class="logo" aria-label="Hero MotoCorp home">' +
                        '<img src="nehan hero logo.png" alt="Hero Logo">' +
                    "</a>" +
                    '<ul class="nav-links">' +
                        '<li><a href="index.html">Home</a></li>' +
                        '<li><a href="index.html" class="red-text">Premia</a></li>' +
                        '<li><a href="explore.html">Explore</a></li>' +
                        '<li><a href="service.html">Service</a></li>' +
                        '<li><a href="contact.html">Contact</a></li>' +
                    "</ul>" +
                    '<a class="hm-nav-cta" href="booking.html">Book Now</a>' +
                "</div>" +
            "</header>"
        );

        return q(".hm-generated-header");
    }

    function setupFallbackMenu() {
        var header = ensureHeader();
        if (!header) return;

        var navContainer = q(".nav-container", header);
        var navLinks = q(".nav-links", header);
        if (!navContainer || !navLinks) return;

        if (navContainer.getAttribute("data-fallback-menu-ready") === "1") return;
        navContainer.setAttribute("data-fallback-menu-ready", "1");

        addClass(navLinks, "hm-mobile-nav-panel");

        if (!q(".hm-mobile-nav-toggle", navContainer)) {
            var toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "hm-mobile-nav-toggle";
            toggle.setAttribute("aria-label", "Toggle navigation menu");
            toggle.setAttribute("aria-expanded", "false");
            toggle.innerHTML = "<span></span><span></span><span></span>";
            navContainer.appendChild(toggle);
        }

        var toggleBtn = q(".hm-mobile-nav-toggle", navContainer);
        var backdrop = q(".hm-mobile-nav-backdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.className = "hm-mobile-nav-backdrop";
            document.body.appendChild(backdrop);
        }

        if (!q(".hm-mobile-nav-cta-item", navLinks)) {
            var actionLink = q(".nav-actions a, .hm-nav-cta, .btn-account", navContainer);
            if (actionLink) {
                var ctaItem = document.createElement("li");
                ctaItem.className = "hm-mobile-nav-cta-item";
                var ctaClone = actionLink.cloneNode(true);
                ctaItem.appendChild(ctaClone);
                navLinks.appendChild(ctaItem);
            }
        }

        function applyPanelMetrics() {
            var headerHeight = header.offsetHeight || 74;
            navLinks.style.top = (headerHeight + 8) + "px";
            navLinks.style.maxHeight = "calc(100vh - " + (headerHeight + 22) + "px)";
        }

        function closeMenu(resetDropdowns) {
            removeClass(document.body, "hm-mobile-nav-open");
            removeClass(toggleBtn, "is-active");
            toggleBtn.setAttribute("aria-expanded", "false");
            removeClass(backdrop, "is-visible");
            document.body.style.overflow = "";

            if (resetDropdowns !== false) {
                var openGroups = navLinks.querySelectorAll(".has-dropdown.open");
                var i;
                for (i = 0; i < openGroups.length; i += 1) {
                    removeClass(openGroups[i], "open");
                }
            }
        }

        function openMenu() {
            if (window.innerWidth > 1020) return;
            applyPanelMetrics();
            addClass(document.body, "hm-mobile-nav-open");
            addClass(toggleBtn, "is-active");
            toggleBtn.setAttribute("aria-expanded", "true");
            addClass(backdrop, "is-visible");
            document.body.style.overflow = "hidden";
        }

        function toggleMenu(event) {
            if (event && event.preventDefault) event.preventDefault();
            if (hasClass(document.body, "hm-mobile-nav-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        toggleBtn.addEventListener("click", toggleMenu);
        backdrop.addEventListener("click", function () { closeMenu(); });

        navLinks.addEventListener("click", function (event) {
            var link = findClosest(event.target, "a");
            if (!link || window.innerWidth > 1020) return;

            var listItem = link.parentNode;
            if (listItem && hasClass(listItem, "has-dropdown")) {
                if (event.preventDefault) event.preventDefault();
                var wasOpen = hasClass(listItem, "open");
                var groups = navLinks.querySelectorAll(".has-dropdown.open");
                var i;
                for (i = 0; i < groups.length; i += 1) {
                    if (groups[i] !== listItem) {
                        removeClass(groups[i], "open");
                    }
                }
                if (wasOpen) {
                    removeClass(listItem, "open");
                } else {
                    addClass(listItem, "open");
                }
                return;
            }

            var href = link.getAttribute("href");
            if (href && href !== "#") {
                closeMenu(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            var key = event.key || event.keyCode;
            if (key === "Escape" || key === "Esc" || key === 27) {
                closeMenu();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 1020) {
                closeMenu();
                navLinks.style.top = "";
                navLinks.style.maxHeight = "";
            } else if (hasClass(document.body, "hm-mobile-nav-open")) {
                applyPanelMetrics();
            }
        });
    }

    onReady(function () {
        setupFallbackMenu();
        setTimeout(setupFallbackMenu, 350);
        setTimeout(setupFallbackMenu, 1200);
    });
})();

