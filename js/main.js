"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var values = {
    company: CONFIG.companyName, address: CONFIG.address, city: CONFIG.city,
    email: CONFIG.email, phone: CONFIG.whatsapp, hours: CONFIG.hours
  };
  Object.keys(values).forEach(function (key) {
    document.querySelectorAll("[data-" + key + "]").forEach(function (element) {
      element.textContent = values[key];
    });
  });
  document.title = document.title.replace("[NOM DE LA SOCIÉTÉ]", CONFIG.companyName);
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  var values = {
    company: CONFIG.companyName, address1: CONFIG.address1, city: CONFIG.city,
    email: CONFIG.email, phone: CONFIG.whatsapp, hours: CONFIG.hours
  };
  Object.keys(values).forEach(function (key) {
    document.querySelectorAll("[data-" + key + "]").forEach(function (element) {
      element.textContent = values[key];
    });
  });
  document.title = document.title.replace("[NOM DE LA SOCIÉTÉ]", CONFIG.companyName);
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("main-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("open", !open);
    });
  }

  var featured = document.getElementById("featured-trucks");
  if (featured && typeof TRUCKS !== "undefined") {
    TRUCKS.slice(0, 3).forEach(function (truck) { featured.appendChild(createTruckCard(truck)); });
  }

  setupContactLinks();
});

function createTruckCard(truck) {
  var article = document.createElement("article");
  article.className = "vehicle-card glass";
  var imageWrap = document.createElement("div");
  imageWrap.className = "vehicle-image";
  var image = document.createElement("img");
  image.src = truckImage(truck);
  image.alt = "Illustration du " + truck.brand + " " + truck.name;
  if (truck.remoteImage) image.addEventListener("error", function () { image.src = truck.image; });
  imageWrap.appendChild(image);
  var body = document.createElement("div");
  body.className = "vehicle-body";
  var meta = document.createElement("div"); meta.className = "vehicle-meta";
  var brand = document.createElement("span"); brand.textContent = truck.brand;
  var category = document.createElement("span"); category.textContent = truck.category;
  meta.append(brand, category);
  var title = document.createElement("h3"); title.textContent = truck.name;
  var description = document.createElement("p"); description.textContent = truck.description;
  var pills = document.createElement("div"); pills.className = "spec-pills";
  Object.keys(truck.specs).slice(0, 2).forEach(function (key) {
    var pill = document.createElement("span"); pill.textContent = truck.specs[key]; pills.appendChild(pill);
  });
  var footer = document.createElement("div"); footer.className = "card-footer";
  var link = document.createElement("a"); link.className = "button secondary"; link.href = "camion.html?id=" + encodeURIComponent(truck.id); link.textContent = "Voir les détails";
  var price = document.createElement("span"); price.className = "price"; price.textContent = "Sur devis";
  footer.append(link, price);
  var request = document.createElement("a"); request.className = "text-link"; request.href = "commande.html?id=" + encodeURIComponent(truck.id); request.textContent = "Demander ce camion";
  body.append(meta, title, description, pills, footer, request);
  article.append(imageWrap, body);
  return article;
}

function setupContactLinks() {
  var whatsapp = document.getElementById("contact-whatsapp");
  var email = document.getElementById("contact-email");
  var warning = document.getElementById("contact-warning");
  var warnings = [];
  if (whatsapp) {
    if (hasValidWhatsapp()) {
      whatsapp.href = "https://wa.me/" + CONFIG.whatsapp;
      whatsapp.removeAttribute("aria-disabled");
      whatsapp.target = "_blank"; whatsapp.rel = "noopener";
    } else warnings.push("Le numéro WhatsApp doit être configuré dans js/config.js.");
  }
  if (email) {
    if (hasValidCompanyEmail()) {
      email.href = "mailto:" + CONFIG.email;
      email.removeAttribute("aria-disabled");
    } else warnings.push("L’adresse e-mail doit être configurée dans js/config.js.");
  }
  if (warning) {
    warning.textContent = warnings.join(" ");
    warning.hidden = warnings.length === 0;
  }
}
