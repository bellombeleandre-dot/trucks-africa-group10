"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var search = document.getElementById("recherche");
  var brand = document.getElementById("marque");
  var category = document.getElementById("categorie");
  var grid = document.getElementById("catalogue-grid");
  var count = document.getElementById("result-count");
  var empty = document.getElementById("empty-state");
  var reset = document.getElementById("reset-filters");

  fillSelect(brand, uniqueValues("brand"));
  fillSelect(category, uniqueValues("category"));
  var requestedCategory = new URLSearchParams(location.search).get("categorie");
  if (requestedCategory && uniqueValues("category").indexOf(requestedCategory) !== -1) category.value = requestedCategory;

  function render() {
    var term = search.value.trim().toLocaleLowerCase("fr");
    var results = TRUCKS.filter(function (truck) {
      var text = [truck.brand, truck.name, truck.category, truck.description].join(" ").toLocaleLowerCase("fr");
      return (!term || text.indexOf(term) !== -1) && (!brand.value || truck.brand === brand.value) && (!category.value || truck.category === category.value);
    });
    grid.replaceChildren();
    results.forEach(function (truck) { grid.appendChild(createTruckCard(truck)); });
    count.textContent = results.length + " véhicule" + (results.length > 1 ? "s" : "") + " trouvé" + (results.length > 1 ? "s" : "");
    empty.hidden = results.length !== 0;
  }
  [search, brand, category].forEach(function (control) { control.addEventListener("input", render); });
  reset.addEventListener("click", function () { search.value = ""; brand.value = ""; category.value = ""; render(); search.focus(); });
  render();
});

function uniqueValues(key) {
  return TRUCKS.map(function (truck) { return truck[key]; }).filter(function (value, index, all) { return all.indexOf(value) === index; }).sort();
}
function fillSelect(select, values) {
  values.forEach(function (value) { var option = document.createElement("option"); option.value = value; option.textContent = value; select.appendChild(option); });
}
