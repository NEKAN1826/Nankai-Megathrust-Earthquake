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

/* Leaflet Code */
/* Setup Leaflet Map */
var southWest = L.latLng(20, 100),
  northEast = L.latLng(50, 161),
  bounds = L.latLngBounds(southWest, northEast);

var map = L.map("nankaiMap", {
  maxBounds: bounds,
});

map.setView([34.42, 135, 30], 5.4);

var layerControl = L.control.layers().addTo(map);

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
/* Fetch json Files */
async function fetchJson(path) {
  const apiCallPromise = await fetch(path);
  const apiCallObj = await apiCallPromise.json();
  return apiCallObj;
}

async function geoToMap(geojson, style) {
  let data = await geojson;
  return L.geoJSON(data, { style, onEachFeature: addPopups });
}

async function processLayers(layerObj) {
  try {
    var overlayMaps = {};
    let visibleLayer;
    for (key in layerObj) {
      let tempJson = await layerObj[key];
      let style = tempJson.style || "";
      let group = [];
      tempJson.features.forEach((feature) => {
        let tempGeo = L.geoJSON(feature, {
          style,
          onEachFeature: addPopups,
        });
        group.push(tempGeo);
      });
      console.log(tempJson.name);
      let layerGroup = L.layerGroup(group);
      if (tempJson.visible) {
        layerGroup.addTo(map);
      }
      layerControl.addOverlay(layerGroup, key);
    }
  } catch (error) {
    console.log(error);
  }
}

const geojsonFiles = {
  Risszonen: fetchJson("data/nankai_rupture_zones.geojson"),
  "Mögliche Beben": fetchJson("data/common_nankai_rupture_zones.geojson"),
  Erdplatten: fetchJson("data/PB2002_plates.json"),
  "Nankai-Trog": fetchJson("data/testboundary.geojson"),
};

let plateStyle = {
  smoothFactor: 2,
  fillColor: "gray",
  fillOpacity: 0.2,
  color: "gray",
  weight: 2,
  opacity: 0.6,
};

processLayers(geojsonFiles);

function addPopups(feature, layer) {
  if (!feature) return;
  let popupContent = "";
  if (feature.properties.name) {
    if (feature.properties.ruptureGroup) {
      popupContent += `<h4 style="color:black">${feature.properties.ruptureGroup}</h4><p>${feature.properties.name}</p>`;
    } else {
      popupContent += `<h4 style="color:black">${feature.properties.name}</h4>`;
    }
  }

  if (feature.properties.description)
    popupContent += `<p>${feature.properties.description}</p>`;
  layer.bindPopup(popupContent);
}
