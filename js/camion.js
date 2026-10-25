"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("truck-detail");
  var id = new URLSearchParams(location.search).get("id");
  var truck = id ? findTruck(id) : null;
  if (!truck) {
    var panel = document.createElement("section"); panel.className = "empty-state glass";
    var title = document.createElement("h1"); title.textContent = id ? "Véhicule introuvable" : "Aucun véhicule sélectionné";
    var text = document.createElement("p"); text.textContent = "La référence demandée n’existe pas ou n’a pas été indiquée.";
    var link = document.createElement("a"); link.className = "button primary"; link.href = "catalogue.html"; link.textContent = "Retour au catalogue";
    panel.append(title, text, link); root.appendChild(panel); return;
  }
  document.title = truck.brand + " " + truck.name + " — " + CONFIG.companyName;
  var layout = document.createElement("div"); layout.className = "detail-layout";
  var visual = document.createElement("div"); visual.className = "detail-visual glass";
  var image = document.createElement("img"); image.src = truckImage(truck); image.alt = "Illustration du " + truck.brand + " " + truck.name;
  if (truck.remoteImage) image.addEventListener("error", function () { image.src = truck.image; });
  visual.appendChild(image);
  var copy = document.createElement("article"); copy.className = "detail-copy glass";
  var eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; eyebrow.textContent = truck.brand + " • " + truck.category;
  var title = document.createElement("h1"); title.textContent = truck.name;
  var description = document.createElement("p"); description.textContent = truck.description;
  var table = document.createElement("table"); table.className = "spec-table";
  var caption = document.createElement("caption"); caption.className = "sr-only"; caption.textContent = "Caractéristiques techniques illustratives";
  table.appendChild(caption);
  Object.keys(truck.specs).forEach(function (key) { var row = table.insertRow(); var heading = document.createElement("th"); heading.scope = "row"; heading.textContent = key; var cell = document.createElement("td"); cell.textContent = truck.specs[key]; row.append(heading, cell); });
  var price = document.createElement("h2"); price.textContent = "Prix sur devis";
  var note = document.createElement("p"); note.className = "fine-print"; note.textContent = "Toutes les caractéristiques et disponibilités sont à confirmer.";
  var button = document.createElement("a"); button.className = "button primary"; button.href = "commande.html?id=" + encodeURIComponent(truck.id); button.textContent = "Demander ce camion";
  copy.append(eyebrow, title, description, table, price, note, button);
  layout.append(visual, copy); root.appendChild(layout);
});
