class Accordion {
  constructor(el) {
    this.el = el;
    this.summary = el.querySelector("summary");
    this.content = el.querySelector(".content");
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.summary.addEventListener("click", (e) => this.onClick(e));
  }

  onClick(e) {
    e.preventDefault();
    this.el.style.overflow = "hidden";
    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    this.isClosing = true;

    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.el.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: "ease-out",
      },
    );

    this.animation.onfinish = () => this.onAnimationFinish(false);
    this.animation.oncancel = () => (this.isClosing = false);
  }

  open() {
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.el.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: "ease-out",
      },
    );
    this.animation.onfinish = () => this.onAnimationFinish(true);
    this.animation.oncancel = () => (this.isExpanding = false);
  }

  onAnimationFinish(open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = this.el.style.overflow = "";
  }
}

document.querySelectorAll("details").forEach((el) => {
  new Accordion(el);
});

function scrollToAnchor(id, event) {
  let anchor = document.getElementById(id);
  if (!anchor) return;
  if (event) event.preventDefault();
  anchor.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
  return;
}

var userAgent = navigator.userAgent;
if (userAgent.indexOf("Chrome") > -1) {
  window.addEventListener("resize", checkResize);
}

function checkResize() {
  console.log(window.innerWidth);
  if (window.innerWidth < 1200) {
    const main = document.querySelector("main");
    main.classList.add("overflow-hidden");
    window.removeEventListener("resize", checkResize);
  }
}

let animSet = false;

function toggleMenu(wrapperClass, contentElem, event) {
  try {
    if (event) event.preventDefault();
    const menuElement = document.querySelector(
      `${wrapperClass} ${contentElem}`,
    );

    let state = menuElement.getAttribute("data-open");
    menuElement.setAttribute("data-open", state == "false" ? "true" : "false");
    if (animSet) return;
    if (state == "false") {
      const animTarget = document.querySelector(wrapperClass);
      animTarget.classList.add("closing");
      animSet = true;
    }
  } catch (error) {
    console.log(error);
  }
  return;
}

var southWest = L.latLng(20, 100),
  northEast = L.latLng(50, 161),
  bounds = L.latLngBounds(southWest, northEast);

var map = L.map("nankaiMap", {
  maxBounds: bounds,
});

map.setView([34.42, 135, 30], 5.4);

var OpenStreetMap_DE = L.tileLayer(
  "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    minZoom: 3.5,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
);

OpenStreetMap_DE.addTo(map);

fetch("data/PB2002_boundaries.json")
  .then((response) => response.json())
  .then((geojsonData) => {
    console.log(geojsonData);
    L.geoJSON(geojsonData, {
      style: {
        color: "#ff1100",
        weight: 2,
        opacity: 0.7,
      },
    }).addTo(map);
  });

fetch("data/PB2002_plates.json")
  .then((response) => response.json())
  .then((geojsonData) => {
    console.log(geojsonData);
    L.geoJSON(geojsonData, {
      style: {
        color: "#ff1100",
        weight: 3,
        opacity: 0.7,
      },
      onEachFeature: addPopups,
    }).addTo(map);
  });

function addPopups(feature, layer) {
  if (feature.properties && feature.properties.PlateName) {
    layer.bindPopup(feature.properties.PlateName);
  }
}
