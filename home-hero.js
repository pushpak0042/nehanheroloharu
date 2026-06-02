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

    if (!menuToggle || !mainNav) {
        return;
    }

    function isMobile() {
        return window.innerWidth <= 1020;
    }

    function closeAllSubmenus() {
        for (var i = 0; i < submenuParents.length; i += 1) {
            submenuParents[i].classList.remove("submenu-open");
            var btn = submenuParents[i].querySelector(".nav-btn");
            if (btn) {
                btn.setAttribute("aria-expanded", "false");
            }
        }
    }

    function closeMenu() {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
        if (menuBackdrop) {
            menuBackdrop.hidden = true;
        }
        closeAllSubmenus();
    }

    menuToggle.addEventListener("click", function () {
        var willOpen = !mainNav.classList.contains("is-open");
        mainNav.classList.toggle("is-open", willOpen);
        menuToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        document.body.classList.toggle("menu-open", willOpen);
        if (menuBackdrop) {
            menuBackdrop.hidden = !willOpen;
        }
        if (!willOpen) {
            closeAllSubmenus();
        }
    });

    document.addEventListener("click", function (event) {
        if (!isMobile()) {
            return;
        }
        var clickedInsideMenu = mainNav.contains(event.target) || menuToggle.contains(event.target);
        if (!clickedInsideMenu && mainNav.classList.contains("is-open")) {
            closeMenu();
        }
    });

    for (var i = 0; i < submenuParents.length; i += 1) {
        (function (parent) {
            var button = parent.querySelector(".nav-btn");
            if (!button) {
                return;
            }
            button.addEventListener("click", function (event) {
                if (!isMobile()) {
                    return;
                }
                event.preventDefault();
                var shouldOpen = !parent.classList.contains("submenu-open");
                closeAllSubmenus();
                parent.classList.toggle("submenu-open", shouldOpen);
                button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
            });
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
