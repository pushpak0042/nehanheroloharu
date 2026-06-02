document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHeroSlider();
    initCategoryTabs();
});

function initMenu() {
    var menuToggle = document.getElementById("menuToggle");
    var mainNav = document.getElementById("mainNav");
    var menuBackdrop = document.getElementById("menuBackdrop");
    var submenuParents = document.querySelectorAll(".has-submenu");
    var lastTouchToggle = 0;
    var originalNavParent = mainNav ? mainNav.parentNode : null;
    var originalNavNext = mainNav ? mainNav.nextSibling : null;
    var mobileDrawer = null;

    if (!menuToggle || !mainNav) {
        return;
    }

    if (mainNav.getAttribute("data-menu-ready") === "true") {
        return;
    }
    mainNav.setAttribute("data-menu-ready", "true");

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
        return window.innerWidth <= 1020;
    }

    function getLinkLabel(link) {
        var strong = link ? link.querySelector("strong") : null;
        return (strong ? strong.textContent : link.textContent).replace(/\s+/g, " ").trim();
    }

    function createDrawerLink(text, href) {
        var link = document.createElement("a");
        link.href = href || "#";
        link.textContent = text;
        return link;
    }

    function createMobileDrawer() {
        if (mobileDrawer) {
            return mobileDrawer;
        }

        mobileDrawer = document.createElement("nav");
        mobileDrawer.id = "mobileMainDrawer";
        mobileDrawer.className = "mobile-main-drawer";
        mobileDrawer.setAttribute("aria-label", "Mobile navigation");
        mobileDrawer.setAttribute("aria-hidden", "true");

        var drawerHeader = document.createElement("div");
        drawerHeader.className = "mobile-drawer-header";

        var drawerTitle = document.createElement("span");
        drawerTitle.textContent = "Nehan Hero";

        var closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "mobile-drawer-close";
        closeButton.setAttribute("aria-label", "Close menu");
        closeButton.textContent = "X";

        drawerHeader.appendChild(drawerTitle);
        drawerHeader.appendChild(closeButton);
        mobileDrawer.appendChild(drawerHeader);

        var list = document.createElement("ul");
        list.className = "mobile-drawer-list";

        var homeItem = document.createElement("li");
        homeItem.appendChild(createDrawerLink("Home", "index.html"));
        list.appendChild(homeItem);

        for (var i = 0; i < submenuParents.length; i += 1) {
            var parent = submenuParents[i];
            var button = parent.querySelector(".nav-btn");
            var panel = parent.querySelector(".submenu-panel");
            if (!button || !panel) {
                continue;
            }

            var groupItem = document.createElement("li");
            groupItem.className = "mobile-drawer-group";

            var groupTitle = document.createElement("div");
            groupTitle.className = "mobile-drawer-group-title";
            groupTitle.textContent = button.textContent.replace(/\s+/g, " ").trim();
            groupItem.appendChild(groupTitle);

            var groupLinks = document.createElement("div");
            groupLinks.className = "mobile-drawer-group-links";
            var panelLinks = panel.querySelectorAll("a");
            for (var p = 0; p < panelLinks.length; p += 1) {
                groupLinks.appendChild(createDrawerLink(getLinkLabel(panelLinks[p]), panelLinks[p].getAttribute("href")));
            }
            groupItem.appendChild(groupLinks);
            list.appendChild(groupItem);
        }

        var directLinks = mainNav.querySelectorAll(".nav-list > li:not(.has-submenu):not(.mobile-menu-home) > a");
        for (var d = 0; d < directLinks.length; d += 1) {
            var directItem = document.createElement("li");
            directItem.appendChild(createDrawerLink(getLinkLabel(directLinks[d]), directLinks[d].getAttribute("href")));
            list.appendChild(directItem);
        }

        var actionLinks = mainNav.querySelectorAll(".nav-actions a");
        for (var a = 0; a < actionLinks.length; a += 1) {
            var actionItem = document.createElement("li");
            actionItem.className = "mobile-drawer-action";
            actionItem.appendChild(createDrawerLink(getLinkLabel(actionLinks[a]), actionLinks[a].getAttribute("href")));
            list.appendChild(actionItem);
        }

        mobileDrawer.appendChild(list);
        document.body.appendChild(mobileDrawer);

        closeButton.addEventListener("click", closeMenu);
        closeButton.addEventListener("touchstart", function (event) {
            if (event && event.preventDefault) event.preventDefault();
            closeMenu();
        }, false);

        var mobileLinks = mobileDrawer.querySelectorAll("a");
        for (var m = 0; m < mobileLinks.length; m += 1) {
            mobileLinks[m].addEventListener("click", function () {
                if (isMobile()) {
                    closeMenu();
                }
            });
        }

        return mobileDrawer;
    }

    function placeDrawerForViewport() {
        if (!originalNavParent) {
            return;
        }

        if (isMobile()) {
            if (menuBackdrop && menuBackdrop.parentNode !== document.body) {
                document.body.appendChild(menuBackdrop);
            }
            return;
        }

        if (mainNav.parentNode !== originalNavParent) {
            originalNavParent.insertBefore(mainNav, originalNavNext);
        }
    }

    function closeAllSubmenus() {
        for (var i = 0; i < submenuParents.length; i += 1) {
            removeClass(submenuParents[i], "submenu-open");
            var btn = submenuParents[i].querySelector(".nav-btn");
            if (btn) {
                btn.setAttribute("aria-expanded", "false");
            }
        }
    }

    function openAllSubmenus() {
        for (var i = 0; i < submenuParents.length; i += 1) {
            addClass(submenuParents[i], "submenu-open");
            var btn = submenuParents[i].querySelector(".nav-btn");
            if (btn) {
                btn.setAttribute("aria-expanded", "true");
            }
        }
    }

    function setMenuOpen(isOpen) {
        placeDrawerForViewport();

        if (isMobile()) {
            var drawer = createMobileDrawer();
            if (isOpen) {
                addClass(drawer, "is-open");
                addClass(menuToggle, "is-active");
                addClass(document.body, "menu-open");
                drawer.setAttribute("aria-hidden", "false");
                menuToggle.setAttribute("aria-expanded", "true");
            } else {
                removeClass(drawer, "is-open");
                removeClass(menuToggle, "is-active");
                removeClass(document.body, "menu-open");
                drawer.setAttribute("aria-hidden", "true");
                menuToggle.setAttribute("aria-expanded", "false");
            }

            if (menuBackdrop) {
                menuBackdrop.hidden = !isOpen;
            }
            return;
        }

        if (mobileDrawer) {
            removeClass(mobileDrawer, "is-open");
            mobileDrawer.setAttribute("aria-hidden", "true");
        }

        if (isOpen) {
            addClass(mainNav, "is-open");
            addClass(menuToggle, "is-active");
            addClass(document.body, "menu-open");
            mainNav.setAttribute("data-open", "true");
            menuToggle.setAttribute("aria-expanded", "true");
            if (isMobile()) {
                openAllSubmenus();
            }
        } else {
            removeClass(mainNav, "is-open");
            removeClass(menuToggle, "is-active");
            removeClass(document.body, "menu-open");
            mainNav.setAttribute("data-open", "false");
            menuToggle.setAttribute("aria-expanded", "false");
            closeAllSubmenus();
        }

        if (menuBackdrop) {
            menuBackdrop.hidden = !isOpen;
        }
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleMenuToggle(event) {
        if (event && event.type === "click" && Date.now() - lastTouchToggle < 450) {
            return;
        }
        if (event && event.type === "touchstart") {
            lastTouchToggle = Date.now();
        }
        if (event && event.preventDefault) event.preventDefault();
        if (event && event.stopPropagation) event.stopPropagation();

        var drawerIsOpen = mobileDrawer && hasClass(mobileDrawer, "is-open");
        setMenuOpen(isMobile() ? !drawerIsOpen : !hasClass(mainNav, "is-open"));
    }

    menuToggle.addEventListener("click", handleMenuToggle);
    menuToggle.addEventListener("touchstart", handleMenuToggle, false);

    document.addEventListener("click", function (event) {
        if (!isMobile()) {
            return;
        }
        var clickedInsideMenu = mainNav.contains(event.target) || menuToggle.contains(event.target);
        if (mobileDrawer) {
            clickedInsideMenu = clickedInsideMenu || mobileDrawer.contains(event.target);
        }
        if (!clickedInsideMenu && hasClass(mainNav, "is-open")) {
            closeMenu();
        }
        if (!clickedInsideMenu && mobileDrawer && hasClass(mobileDrawer, "is-open")) {
            closeMenu();
        }
    });

    for (var i = 0; i < submenuParents.length; i += 1) {
        (function (parent) {
            var button = parent.querySelector(".nav-btn");
            var lastTouchSubmenu = 0;
            if (!button) {
                return;
            }
            function handleSubmenuToggle(event) {
                if (event && event.type === "click" && Date.now() - lastTouchSubmenu < 450) {
                    return;
                }
                if (event && event.type === "touchstart") {
                    lastTouchSubmenu = Date.now();
                }
                if (!isMobile()) {
                    return;
                }
                if (event && event.preventDefault) event.preventDefault();
                if (event && event.stopPropagation) event.stopPropagation();
                openAllSubmenus();
            }
            button.addEventListener("click", handleSubmenuToggle);
            button.addEventListener("touchstart", handleSubmenuToggle, false);
        })(submenuParents[i]);
    }

    if (menuBackdrop) {
        menuBackdrop.addEventListener("click", function () {
            closeMenu();
        });
    }

    var menuLinks = mainNav.querySelectorAll("a");
    for (var j = 0; j < menuLinks.length; j += 1) {
        menuLinks[j].addEventListener("click", function () {
            if (isMobile()) {
                closeMenu();
            }
        });
    }

    window.addEventListener("resize", function () {
        if (!isMobile()) {
            closeMenu();
            mainNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            placeDrawerForViewport();
        } else {
            placeDrawerForViewport();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("hashchange", function () {
        if (isMobile()) {
            closeMenu();
        }
    });
}

function initHeroSlider() {
    var slides = document.querySelectorAll(".hero-slide");
    var dots = document.querySelectorAll(".hero-dots .dot");
    var prevBtn = document.getElementById("heroPrev");
    var nextBtn = document.getElementById("heroNext");

    if (!slides.length) {
        return;
    }

    var index = 0;
    var timer = null;
    var intervalMs = 7000;

    function pauseAllVideos() {
        for (var i = 0; i < slides.length; i += 1) {
            var video = slides[i].querySelector("video");
            if (video) {
                video.pause();
            }
        }
    }

    function playActiveVideo(activeSlide) {
        var video = activeSlide.querySelector("video");
        if (video) {
            video.muted = true;
            video.play().catch(function () {
                return;
            });
        }
    }

    function showSlide(targetIndex) {
        if (targetIndex < 0) {
            targetIndex = slides.length - 1;
        }
        if (targetIndex >= slides.length) {
            targetIndex = 0;
        }

        index = targetIndex;
        pauseAllVideos();

        for (var i = 0; i < slides.length; i += 1) {
            slides[i].classList.toggle("is-active", i === index);
        }
        for (var j = 0; j < dots.length; j += 1) {
            dots[j].classList.toggle("is-active", j === index);
        }

        playActiveVideo(slides[index]);
    }

    function nextSlide() {
        showSlide(index + 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = setInterval(nextSlide, intervalMs);
    }

    function stopAutoPlay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            showSlide(index - 1);
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            showSlide(index + 1);
            startAutoPlay();
        });
    }

    for (var d = 0; d < dots.length; d += 1) {
        dots[d].addEventListener("click", function () {
            var target = parseInt(this.getAttribute("data-slide"), 10);
            if (!isNaN(target)) {
                showSlide(target);
                startAutoPlay();
            }
        });
    }

    showSlide(0);
    startAutoPlay();
}

function initCategoryTabs() {
    var tabButtons = document.querySelectorAll(".tab-btn");
    var tabPanels = document.querySelectorAll(".tab-panel");

    if (!tabButtons.length || !tabPanels.length) {
        return;
    }

    function activate(targetId) {
        for (var i = 0; i < tabButtons.length; i += 1) {
            var isActiveButton = tabButtons[i].getAttribute("data-target") === targetId;
            tabButtons[i].classList.toggle("is-active", isActiveButton);
            tabButtons[i].setAttribute("aria-selected", isActiveButton ? "true" : "false");
        }

        for (var j = 0; j < tabPanels.length; j += 1) {
            var isActivePanel = tabPanels[j].id === targetId;
            tabPanels[j].classList.toggle("is-active", isActivePanel);
            tabPanels[j].hidden = !isActivePanel;
        }
    }

    for (var b = 0; b < tabButtons.length; b += 1) {
        tabButtons[b].addEventListener("click", function () {
            var target = this.getAttribute("data-target");
            if (target) {
                activate(target);
            }
        });
    }

    for (var p = 0; p < tabPanels.length; p += 1) {
        tabPanels[p].hidden = !tabPanels[p].classList.contains("is-active");
    }
}
