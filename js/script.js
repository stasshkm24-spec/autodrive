const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

if (burger && nav) {
    burger.addEventListener("click", () => {
        burger.classList.toggle("active");
        nav.classList.toggle("active");
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            burger.classList.remove("active");
            nav.classList.remove("active");
        });
    });
}

const slides = document.querySelectorAll(".hero-slide");
const dotsWrapper = document.getElementById("sliderDots");
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");

if (slides.length && dotsWrapper && prevButton && nextButton) {
    let currentSlide = 0;
    let sliderTimer;

    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "slider-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Слайд ${index + 1}`);
        dot.addEventListener("click", () => {
            showSlide(index);
            restartSlider();
        });
        dotsWrapper.appendChild(dot);
    });

    const dots = document.querySelectorAll(".slider-dot");

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlider() {
        sliderTimer = setInterval(nextSlide, 4500);
    }

    function restartSlider() {
        clearInterval(sliderTimer);
        startSlider();
    }

    nextButton.addEventListener("click", () => {
        nextSlide();
        restartSlider();
    });

    prevButton.addEventListener("click", () => {
        prevSlide();
        restartSlider();
    });

    showSlide(currentSlide);
    startSlider();
}

function getCardsPerPage() {
    if (window.innerWidth <= 560) return 2;
    if (window.innerWidth <= 1024) return 4;
    return 8;
}

function createPaginator(options) {
    const cards = Array.from(document.querySelectorAll(options.cardSelector));
    const prev = document.querySelector(options.prevSelector);
    const next = document.querySelector(options.nextSelector);
    const info = document.querySelector(options.infoSelector);

    if (!cards.length || !prev || !next || !info) return null;

    let page = 1;
    let filter = "all";

    function matchesCategory(card) {
        if (filter === "all") return true;
        return card.dataset.category && card.dataset.category.split(" ").includes(filter);
    }

    function getFilteredCards() {
        return cards.filter(matchesCategory);
    }

    function render() {
        const perPage = getCardsPerPage();
        const filtered = getFilteredCards();
        const pages = Math.max(1, Math.ceil(filtered.length / perPage));

        if (page > pages) page = pages;
        if (page < 1) page = 1;

        cards.forEach((card) => card.classList.add("is-hidden"));

        filtered.forEach((card, index) => {
            const isVisible = index >= (page - 1) * perPage && index < page * perPage;
            card.classList.toggle("is-hidden", !isVisible);
        });

        info.textContent = `${page} / ${pages}`;
        prev.disabled = page === 1;
        next.disabled = page === pages;
    }

    prev.addEventListener("click", () => {
        page -= 1;
        render();
    });

    next.addEventListener("click", () => {
        page += 1;
        render();
    });

    window.addEventListener("resize", render);

    return {
        setFilter(nextFilter) {
            filter = nextFilter;
            page = 1;
            render();
        },
        render,
    };
}

const homePaginator = createPaginator({
    cardSelector: "#homeCars .car-card",
    prevSelector: "[data-catalog-prev='home']",
    nextSelector: "[data-catalog-next='home']",
    infoSelector: "#homeCatalogInfo",
});

if (homePaginator) {
    document.querySelectorAll("[data-filter-group='home'] .tab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-filter-group='home'] .tab-btn").forEach((item) => {
                item.classList.remove("active");
            });
            button.classList.add("active");
            homePaginator.setFilter(button.dataset.filter);
        });
    });

    homePaginator.render();
}

const catalogGrid = document.getElementById("catalogGrid");
const catalogForm = document.getElementById("catalogSearch");
const catalogCount = document.getElementById("catalogCount");

if (catalogGrid && catalogForm) {
    const catalogCards = Array.from(catalogGrid.querySelectorAll(".catalog-item"));
    const prev = document.querySelector("[data-catalog-prev='main']");
    const next = document.querySelector("[data-catalog-next='main']");
    const pageInfo = document.getElementById("catalogPageInfo");
    const resetButton = document.getElementById("resetCatalogFilters");
    let page = 1;
    let activeQuick = "all";

    function value(name) {
        return catalogForm.elements[name].value.trim().toLowerCase();
    }

    function isMatch(card) {
        const brand = value("brand");
        const model = value("model");
        const year = value("year");
        const price = value("price");
        const fuel = value("fuel");
        const gearbox = value("gearbox");
        const drive = value("drive");
        const mileage = value("mileage");
        const categories = card.dataset.category.split(" ");

        if (activeQuick !== "all" && !categories.includes(activeQuick)) return false;
        if (brand !== "all" && card.dataset.brand !== brand) return false;
        if (model && !card.dataset.model.includes(model)) return false;
        if (year !== "all" && card.dataset.year !== year) return false;
        if (price !== "all" && Number(card.dataset.price) > Number(price)) return false;
        if (fuel !== "all" && card.dataset.fuel !== fuel) return false;
        if (gearbox !== "all" && card.dataset.gearbox !== gearbox) return false;
        if (drive !== "all" && card.dataset.drive !== drive) return false;
        if (mileage !== "all" && Number(card.dataset.mileage) > Number(mileage)) return false;

        return true;
    }

    function renderCatalog() {
        const perPage = getCardsPerPage();
        const filtered = catalogCards.filter(isMatch);
        const pages = Math.max(1, Math.ceil(filtered.length / perPage));

        if (page > pages) page = pages;
        if (page < 1) page = 1;

        catalogCards.forEach((card) => card.classList.add("is-hidden"));

        filtered.forEach((card, index) => {
            const isVisible = index >= (page - 1) * perPage && index < page * perPage;
            card.classList.toggle("is-hidden", !isVisible);
        });

        catalogCount.textContent = `Знайдено: ${filtered.length} авто`;
        pageInfo.textContent = `${page} / ${pages}`;
        prev.disabled = page === 1;
        next.disabled = page === pages;
    }

    catalogForm.addEventListener("submit", (event) => {
        event.preventDefault();
        page = 1;
        renderCatalog();
    });

    catalogForm.querySelectorAll("select, input").forEach((field) => {
        field.addEventListener("change", () => {
            page = 1;
            renderCatalog();
        });
    });

    resetButton.addEventListener("click", () => {
        catalogForm.reset();
        activeQuick = "all";
        page = 1;
        document.querySelectorAll("[data-catalog-quick], .side-filter button").forEach((button) => {
            button.classList.remove("active");
        });
        document.querySelector("[data-catalog-quick='all']").classList.add("active");
        renderCatalog();
    });

    document.querySelectorAll("[data-side-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            const field = catalogForm.elements[button.dataset.sideFilter];
            field.value = button.dataset.value;
            page = 1;
            button.closest(".side-filter").querySelectorAll("button").forEach((item) => {
                item.classList.remove("active");
            });
            button.classList.add("active");
            renderCatalog();
        });
    });

    document.querySelectorAll("[data-catalog-quick]").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-catalog-quick]").forEach((item) => {
                item.classList.remove("active");
            });
            button.classList.add("active");
            activeQuick = button.dataset.catalogQuick;
            page = 1;
            renderCatalog();
        });
    });

    prev.addEventListener("click", () => {
        page -= 1;
        renderCatalog();
    });

    next.addEventListener("click", () => {
        page += 1;
        renderCatalog();
    });

    document.querySelectorAll(".fav-btn").forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.toggle("active");
        });
    });

    window.addEventListener("resize", renderCatalog);
    renderCatalog();
}
