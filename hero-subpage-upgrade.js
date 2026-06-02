// Shared Hero MotoCorp-style subpage behavior.
(function () {
    const HOME_RE = /(^|\/)(index\.html?)?$/i;
    const path = window.location.pathname.replace(/\\/g, "/");
    const isHome = HOME_RE.test(path);

    function init() {
        if (document.body && document.body.dataset.hmUpgradeInit === "true") {
            return;
        }
        if (document.body) {
            document.body.dataset.hmUpgradeInit = "true";
        }

        normalizeBrokenReferences();
        setupMobileNavigation();

        if (isHome) {
            return;
        }

        document.body.classList.add("hm-subpage");
        document.body.classList.toggle("hm-product-page", Boolean(document.querySelector(".sub-navbar, #bike-render, .color-selector")));

        ensureHeader();
        setupMobileNavigation();
        ensureFooter();
        enhanceImages();
        enhanceColorControls();
        enhanceStickyState();
        enhanceBackToTop();
        initAosSafely();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    function normalizeBrokenReferences() {
        document.querySelectorAll('img[src="hero-logo.png"], img[src="hero logo.png"], img[src="nehan hero logo.png"]').forEach((image) => {
            image.src = "nehan hero logo.png";
        });

        document.querySelectorAll('a[href="premia.html"]').forEach((link) => {
            link.href = "index.html";
        });
    }

    function setupMobileNavigation() {
        const header = document.querySelector(".main-header, .navbar, .hm-generated-header");
        if (!header) return;

        const navContainer = header.querySelector(".nav-container");
        const navLinks = header.querySelector(".nav-links");
        if (!navContainer || !navLinks) return;
        if (navContainer.dataset.hmMobileNavReady === "true") return;
        navContainer.dataset.hmMobileNavReady = "true";

        navLinks.classList.add("hm-mobile-nav-panel");

        if (!navLinks.id) {
            navLinks.id = `hm-nav-${Math.random().toString(36).slice(2, 10)}`;
        }

        let toggle = navContainer.querySelector(".hm-mobile-nav-toggle");
        if (!toggle) {
            toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "hm-mobile-nav-toggle";
            toggle.setAttribute("aria-label", "Toggle navigation menu");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-controls", navLinks.id);
            toggle.innerHTML = "<span></span><span></span><span></span>";
            navContainer.appendChild(toggle);
        }

        if (!navLinks.querySelector(".hm-mobile-nav-cta-item")) {
            const primaryAction = navContainer.querySelector(".nav-actions a, .hm-nav-cta, .btn-account");
            if (primaryAction) {
                const actionItem = document.createElement("li");
                actionItem.className = "hm-mobile-nav-cta-item";
                const clonedAction = primaryAction.cloneNode(true);
                clonedAction.classList.add("hm-mobile-nav-cta-link");
                actionItem.appendChild(clonedAction);
                navLinks.appendChild(actionItem);
            }
        }

        let backdrop = document.querySelector(".hm-mobile-nav-backdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.className = "hm-mobile-nav-backdrop";
            document.body.appendChild(backdrop);
        }

        const closeMenu = (resetDropdowns = true) => {
            document.body.classList.remove("hm-mobile-nav-open");
            toggle.classList.remove("is-active");
            toggle.setAttribute("aria-expanded", "false");
            backdrop.classList.remove("is-visible");
            document.body.style.removeProperty("overflow");
            document.documentElement.style.removeProperty("--hm-mobile-nav-top");
            document.documentElement.style.removeProperty("--hm-mobile-nav-max-height");

            if (resetDropdowns) {
                navLinks.querySelectorAll(".has-dropdown.open").forEach((group) => {
                    group.classList.remove("open");
                });
            }
        };

        const openMenu = () => {
            if (window.innerWidth > 1020) return;
            const headerHeight = Math.max(68, Math.round(header.getBoundingClientRect().height));
            document.documentElement.style.setProperty("--hm-mobile-nav-top", `${headerHeight + 8}px`);
            document.documentElement.style.setProperty("--hm-mobile-nav-max-height", `calc(100vh - ${headerHeight + 22}px)`);
            document.body.classList.add("hm-mobile-nav-open");
            toggle.classList.add("is-active");
            toggle.setAttribute("aria-expanded", "true");
            backdrop.classList.add("is-visible");
            document.body.style.overflow = "hidden";
        };

        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            if (document.body.classList.contains("hm-mobile-nav-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        backdrop.addEventListener("click", () => {
            closeMenu();
        });

        navLinks.addEventListener("click", (event) => {
            const link = event.target.closest("a");
            if (!link || window.innerWidth > 1020) return;

            const parent = link.parentElement;
            const hasDirectDropdownChild = parent &&
                parent.classList &&
                parent.classList.contains("has-dropdown") &&
                Array.from(parent.children).some((child) =>
                    child.classList && (child.classList.contains("dropdown-menu") || child.classList.contains("dropdown-content"))
                );

            const isDropdownTrigger = link.matches(".has-dropdown > a") || hasDirectDropdownChild;

            if (isDropdownTrigger && !isHome) {
                event.preventDefault();
                const group = link.closest(".has-dropdown");
                if (!group) return;

                const wasOpen = group.classList.contains("open");
                navLinks.querySelectorAll(".has-dropdown.open").forEach((item) => {
                    if (item !== group) item.classList.remove("open");
                });

                group.classList.toggle("open", !wasOpen);
                return;
            }

            const href = link.getAttribute("href");
            if (href && href !== "#") {
                closeMenu(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1020) {
                closeMenu();
            }
        });
    }

    function ensureHeader() {
        if (document.querySelector(".main-header, .navbar, .hm-generated-header")) {
            return;
        }

        document.body.insertAdjacentHTML("afterbegin", `
            <header class="hm-generated-header">
                <div class="nav-container">
                    <a href="index.html" class="logo" aria-label="Hero MotoCorp home">
                        <img src="nehan hero logo.png" alt="Hero Logo">
                    </a>
                    <ul class="nav-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="index.html" class="red-text">Premia</a></li>
                        <li><a href="explore.html">Explore</a></li>
                        <li><a href="service.html">Service</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                    <a class="hm-nav-cta" href="booking.html">Book Now</a>
                </div>
            </header>
        `);
    }

    function ensureFooter() {
        const existingFooter = document.querySelector("footer");
        if (existingFooter) {
            existingFooter.classList.add("site-footer");
            return;
        }

        document.body.insertAdjacentHTML("beforeend", `
            <footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-col">
                        <h4>Contact</h4>
                        <p>Phone: +91 7015139162<br>Email: info@heromotocorp.com</p>
                    </div>
                    <div class="footer-col">
                        <h4>Address</h4>
                        <p>Nehan Hero Loharu<br>Loharu, Bhiwani<br>Haryana - 127201</p>
                    </div>
                    <div class="footer-col">
                        <h4>Quick Links</h4>
                        <a href="index.html">Home</a><br>
                        <a href="service.html">Service</a><br>
                        <a href="contact.html">Contact</a>
                    </div>
                </div>
                <div class="footer-bottom">© 2026 Hero MotoCorp. All Rights Reserved.</div>
            </footer>
        `);
    }

    function enhanceImages() {
        document.querySelectorAll("img").forEach((image) => {
            image.loading = image.loading || "lazy";
            image.decoding = image.decoding || "async";

            image.addEventListener("error", () => {
                if (image.dataset.fallbackApplied === "true") return;
                image.dataset.fallbackApplied = "true";
                image.classList.add("hm-image-missing");
                image.src = "nehan hero logo.png";
            });
        });
    }

    function enhanceColorControls() {
        const controls = document.querySelectorAll(".dot[data-img], .color-btn[data-image]");

        controls.forEach((control) => {
            if (!control.hasAttribute("role")) control.setAttribute("role", "button");
            if (!control.hasAttribute("tabindex")) control.setAttribute("tabindex", "0");
            if (!control.getAttribute("aria-label")) {
                control.setAttribute("aria-label", control.dataset.color || control.title || "Select colour");
            }

            const activate = () => {
                const image = control.dataset.img || control.dataset.image;
                const name = control.dataset.name ||
                    control.dataset.label ||
                    control.getAttribute("aria-label") ||
                    control.title ||
                    control.dataset.color ||
                    "";
                const target = document.getElementById("bike-render") ||
                    document.getElementById("bike-image") ||
                    document.getElementById("main-scooter-img");

                controls.forEach((item) => {
                    item.classList.remove("active");
                    item.setAttribute("aria-pressed", "false");
                });

                control.classList.add("active");
                control.setAttribute("aria-pressed", "true");

                if (target && image) {
                    target.style.opacity = "0";
                    setTimeout(() => {
                        target.src = image;
                        target.style.opacity = "1";
                    }, 140);
                }

                const colorName = document.getElementById("color-name");
                if (colorName && name && !control.dataset.name) {
                    colorName.textContent = toTitle(name);
                }
            };

            control.addEventListener("click", activate);
            control.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                }
            });
        });
    }

    function enhanceStickyState() {
        const header = document.querySelector(".main-header, .navbar, .hm-generated-header");
        const subnav = document.querySelector(".sub-navbar");
        if (!header && !subnav) return;

        const onScroll = () => {
            const active = window.scrollY > 24;
            if (header) {
                header.classList.toggle("is-scrolled", active);
            }
            if (subnav) {
                subnav.classList.toggle("is-scrolled", active);
            }
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    function enhanceBackToTop() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hm-back-to-top";
        button.setAttribute("aria-label", "Back to top");
        button.textContent = "↑";
        document.body.appendChild(button);

        button.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        const toggle = () => {
            button.classList.toggle("is-visible", window.scrollY > 500);
        };

        toggle();
        window.addEventListener("scroll", toggle, { passive: true });
    }

    function initAosSafely() {
        if (!window.AOS || document.body.dataset.hmAosReady === "true") {
            return;
        }

        window.AOS.init({
            duration: 900,
            once: true,
            offset: 80
        });

        document.body.dataset.hmAosReady = "true";
    }

    function toTitle(value) {
        return String(value)
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
})();
