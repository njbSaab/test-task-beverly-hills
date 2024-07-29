document.addEventListener("DOMContentLoaded", function () {
  var splideMain = new Splide(".splide-main", {
    type: "loop",
    perPage: 1,
    autoplay: true,
  });

  var tourSplide = new Splide(".tour-splide", {
    type: "loop",
    drag: "free",
    autoplay: true,
    focus: "center",
    perPage: 3,
    autoScroll: {
      speed: 1,
    },
  });
  var advantagesSlider = new Splide(".advantages-slider", {
    type: "loop",
    autoplay: true,
    arrows: false,
    pagination: false,
    interval: 3000, // Adjust the interval as needed
  });

  splideMain.mount();
  tourSplide.mount();
  advantagesSlider.mount();
});
