import * as bootstrap from "bootstrap";
import { favourite } from "./index.js";

export function createCarouselItem(imgSrc, imgAlt, imgId) {
    const template = document.querySelector("#carouselItemTemplate");
    const clone = template.content.firstElementChild.cloneNode(true);

    const img = clone.querySelector("img");
    img.src = imgSrc;
    img.alt = imgAlt;

    const favBtn = clone.querySelector(".favourite-button");
    favBtn.addEventListener("click", () => {
        favourite(imgId);
    });

    return clone;
}

export function clear() {
    const carousel = document.querySelector("#carouselInner");
    while (carousel.firstChild) {
        carousel.removeChild(carousel.firstChild);
    }
}

export function appendCarousel(element) {
    const carousel = document.querySelector("#carouselInner");

    const activeItem = document.querySelector(".carousel-item.active");
    if (!activeItem) element.classList.add("active");

    carousel.appendChild(element);
}

export function start() {
    const multipleCardCarousel = document.querySelector("#carouselControls");
    if (window.matchMedia("(min-width: 768px)").matches) {
        const carousel = new bootstrap.Carousel(multipleCardCarousel, {
            interval: false,
        });
        const carouselWidth = $(".carousel-inner")[0].scrollWidth;
        const cardWidth = $(".carousel-item").width();
        let scrollPosition = 0;
        $("#carouselControls.carousel-control-next").unbind();
        $("#carouselControls.carousel-control-next").on("click", function () {
            if (scrollPosition < carouselWidth - cardWidth * 4) {
                scrollPosition += cardWidth;
                $("#carouselControls .carousel-inner").animate(
                    { scrollLeft: scrollPosition },
                    600
                );
            }
        });
        $("#carouselControls.carousel-control-prev").unbind();
        $("#carouselControls.carousel-control-prev").on("click", function () {
            if (scrollPosition > 0) {
                scrollPosition -= cardWidth;
                $("#carouselControls.carousel-inner").animate(
                    { scrollLeft: scrollPosition },
                    600
                );
            }
        });
    } else {
        $(multipleCardCarousel).addClass("slide");
    }
}
