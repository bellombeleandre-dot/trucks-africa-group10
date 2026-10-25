"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("quote-form");
  var vehicle = document.getElementById("vehicule");
  var message = document.getElementById("message");
  var summaryText = document.getElementById("summary-text");
  var summaryReady = document.getElementById("summary-ready");
  var placeholder = document.getElementById("summary-placeholder");
  var status = document.getElementById("channel-status");
  var whatsappButton = document.getElementById("send-whatsapp");
  var emailButton = document.getElementById("send-email");
  var lastSummary = "";

  function value(id) {
    var element = document.getElementById(id);
    return element ? element.value.trim() : "";
  }

  function clearErrors() {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".error").forEach(function (el) { el.textContent = ""; });
  }

  function requiredMessage(text) { 
    return function (v) { return v.trim() ? "" : text; }; 
  }

  TRUCKS.forEach(function (truck) {
    var option = document.createElement("option"); 
    option.value = truck.id; 
    option.textContent = truck.brand + " — " + truck.name + " (" + truck.category + ")"; 
    vehicle.appendChild(option);
  });

  var selectedId = new URLSearchParams(location.search).get("id");
  if (selectedId && findTruck(selectedId)) vehicle.value = selectedId;
  
  document.getElementById("company-email-display").textContent = CONFIG.email;
  whatsappButton.disabled = !hasValidWhatsapp();
  emailButton.disabled = !hasValidCompanyEmail();
  whatsappButton.title = whatsappButton.disabled ? "Configurez le numéro WhatsApp dans js/config.js" : "";
  emailButton.title = emailButton.disabled ? "Configurez l’adresse e-mail dans js/config.js" : "";
  
  message.addEventListener("input", function () { 
    document.getElementById("message-count").textContent = message.value.length + "/600"; 
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm()) return;
    lastSummary = buildSummary();
    summaryText.textContent = lastSummary;
    placeholder.hidden = true; 
    summaryReady.hidden = false;
    status.textContent = configurationWarning();
    summaryReady.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"nearest"});
  });

  whatsappButton.addEventListener("click", async function () {
    if (!refreshSummary()) return;
    if (!hasValidWhatsapp()) { 
      status.textContent = "Action désactivée : configurez un numéro international dans js/config.js."; 
      return; 
    }
    
    var truck = findTruck(vehicle.value);
    var societeClient = value("societe") || value("nom");
    var fileName = "Lettre_Intention_Achat_" + societeClient.replace(/\s+/g, '_') + ".pdf";

    // 1. Générer le document PDF sous forme de Blob pour l'API de partage
    if (!window.jspdf) {
      alert("La bibliothèque PDF n'est pas chargée.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    var precision = value("message") ? value("message") : "Aucune.";
    var optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var dateStr = new Date().toLocaleDateString('fr-FR', optionsDate);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    var nomClient = value("nom");

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(dateStr, 190, 25, { align: "right" });

    doc.setFont("times", "bold");
    doc.text("A l'attention de", 190, 40, { align: "right" });
    doc.text("Mr le Directeur " + CONFIG.companyName, 190, 47, { align: "right" });

    doc.text("Objet : lettre d’intention d’achat", 20, 65);

    doc.setFont("times", "normal");
    var p1 = "Nous soussignée la société " + societeClient + ", représentée par " + nomClient + ", venons par la présente, vous soumettre notre intention d’achat.";
    doc.text(doc.splitTextToSize(p1, 170), 20, 80);

    var p2 = "En effet, dans le cadre de nos activités à " + value("ville") + " (" + value("pays") + "), nous souhaitons acquérir des véhicules industriels.";
    doc.text(doc.splitTextToSize(p2, 170), 20, 95);

    var p3 = "Au vue de ce qui précède monsieur, nous vous faisons suivre les différentes caractéristiques des camions faisant objet de notre intention d’achat :";
    doc.text(doc.splitTextToSize(p3, 170), 20, 110);

    doc.setFont("times", "bold");
    var pPuce = "-" + value("quantite") + " " + truck.name + " de marque " + truck.brand + " (" + truck.category + ") Réf: " + truck.id + ". " + precision;
    doc.text(doc.splitTextToSize(pPuce, 165), 25, 125);

    doc.setFont("times", "normal");
    doc.text("Contact client : " + value("telephone") + " | " + value("email"), 25, 145);

    var p4 = "Vous remerciant de la bonne réception de notre sollicitude, veuillez agréer monsieur, l’expression de notre profond respect.";
    doc.text(doc.splitTextToSize(p4, 170), 20, 165);

    doc.setFont("times", "bold");
    doc.text("LA DIRECTRICE / LE DIRECTEUR", 190, 195, { align: "right" });

    // Créer un objet Fichier (File) à partir du PDF généré
    var pdfBlob = doc.output('blob');
    var pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // 2. Tenter le partage natif (Idéal sur Smartphone : WhatsApp s'ouvre avec le PDF attaché)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: 'Lettre d’intention d’achat',
          text: 'Bonjour, veuillez trouver ci-joint ma lettre d’intention d’achat pour le camion ' + truck.name + '.'
        });
        status.textContent = "Document partagé avec succès via le menu de votre appareil.";
        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          status.textContent = "Partage annulé par l'utilisateur.";
          return; // L'utilisateur a fermé la fenêtre de partage
        }
      }
    }

    // 3. Fallback pour PC / navigateurs ne supportant pas l'envoi de fichiers par partage
    doc.save(fileName);
    var textMessage = encodeURIComponent(
      "Bonjour, veuillez trouver ci-joint ma lettre d'intention d'achat.\n\n📄 Fichier PDF téléchargé : " + fileName + 
      "\n*(Veuillez joindre manuellement ce fichier PDF)*"
    );
    var whatsappUrl = "https://wa.me/" + CONFIG.whatsapp + "?text=" + textMessage;
    window.open(whatsappUrl, "_blank", "noopener");
    status.textContent = "PDF téléchargé sur votre PC et WhatsApp ouvert.";
  });

  emailButton.addEventListener("click", function () {
    if (!refreshSummary()) return;
    if (!hasValidCompanyEmail()) { 
      status.textContent = "Action désactivée : configurez l’adresse e-mail de la société dans js/config.js."; 
      return; 
    }
    
    var truck = findTruck(vehicle.value);
    var societeClient = value("societe") || value("nom");
    var subject = "Lettre d'intention d'achat - " + societeClient + " - " + truck.name;

    // Utilisation directe de lastSummary (la mise en forme originale complète) dans le corps du mail
    var mailtoUrl = "mailto:" + CONFIG.email + 
                    "?subject=" + encodeURIComponent(subject) + 
                    "&body=" + encodeURIComponent(lastSummary);
    
    window.location.href = mailtoUrl;
    
    status.textContent = "Votre application de messagerie s'ouvre avec la lettre d'intention formatée prête à être envoyée.";
  });

  function refreshSummary() {
    if (!validateForm()) return false;
    lastSummary = buildSummary(); 
    summaryText.textContent = lastSummary; 
    placeholder.hidden = true; 
    summaryReady.hidden = false; 
    return true;
  }

  function configurationWarning() {
    var warnings = [];
    if (!hasValidWhatsapp()) warnings.push("WhatsApp désactivé.");
    if (!hasValidCompanyEmail()) warnings.push("E-mail désactivé.");
    return warnings.join(" ");
  }

  function validateForm() {
    clearErrors();
    var rules = [
      ["nom", function (v) { return v.trim() ? "" : "Indiquez votre nom complet."; }],
      ["email", function (v, el) { return v.trim() && el.validity.valid ? "" : "Indiquez une adresse e-mail valide."; }],
      ["telephone", function (v) { return v.trim() && /^[+\d][\d\s().-]{6,29}$/.test(v.trim()) ? "" : "Indiquez un numéro valide."; }],
      ["pays", requiredMessage("Indiquez le pays.")],
      ["ville", requiredMessage("Indiquez la ville.")],
      ["vehicule", function (v) { return findTruck(v) ? "" : "Choisissez un véhicule."; }],
      ["quantite", function (v) { return /^\d+$/.test(v) && Number(v) >= 1 ? "" : "Nombre >= 1 requis."; }]
    ];
    var firstInvalid = null;
    rules.forEach(function (rule) {
      var element = document.getElementById(rule[0]); 
      var error = rule[1](element.value, element);
      if (error) { 
        element.setAttribute("aria-invalid", "true"); 
        element.setAttribute("aria-describedby", rule[0] + "-error"); 
        document.getElementById(rule[0] + "-error").textContent = error; 
        if (!firstInvalid) firstInvalid = element; 
      }
    });
    if (firstInvalid) { firstInvalid.focus(); return false; }
    return true;
  }

  // CORRECTION : Le format du texte correspond exactement à votre modèle de lettre d'intention
  function buildSummary() {
    var truck = findTruck(vehicle.value);
    var precision = value("message") ? " " + value("message") : "";
    
    var optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var dateStr = new Date().toLocaleDateString('fr-FR', optionsDate);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    var nomClient = value("nom");
    var societeClient = value("societe") || nomClient;

    return dateStr + "\n\n" +
           "                                           A l’attention de\n" +
           "                                           Mr le Directeur " + CONFIG.companyName + "\n\n" +
           "Objet : lettre d’intention d’achat\n\n" +
           "Nous soussignée la société " + societeClient + ", représentée par " + nomClient + ", venons par la présente, vous soumettre notre intention d’achat.\n\n" +
           "En effet, dans le cadre de nos activités à " + value("ville") + " (" + value("pays") + "), nous souhaitons acquérir des véhicules industriels.\n\n" +
           "Au vue de ce qui précède monsieur, nous vous faisons suivre les différentes caractéristiques des camions faisant objet de notre intention d’achat :\n\n" +
           "-" + value("quantite") + " " + truck.name + " de marque " + truck.brand + " (" + truck.category + ") Réf: " + truck.id + "." + precision + "\n\n" +
           "Vous remerciant de la bonne réception de notre sollicitude, veuillez agréer monsieur, l’expression de notre profond respect.\n\n\n" +
           "                                           LA DIRECTRICE / LE DIRECTEUR";
  }

  // Génération du PDF officiel respectant la mise en page
  function generatePDF() {
    if (!window.jspdf) {
      alert("La bibliothèque PDF n'est pas chargée.");
      return "Document.pdf";
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    var truck = findTruck(vehicle.value);
    var precision = value("message") ? value("message") : "Aucune.";
    
    var optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var dateStr = new Date().toLocaleDateString('fr-FR', optionsDate);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    var nomClient = value("nom");
    var societeClient = value("societe") || nomClient;

    doc.setFont("times", "normal");
    doc.setFontSize(11);

    doc.text(dateStr, 190, 25, { align: "right" });

    doc.setFont("times", "bold");
    doc.text("A l'attention de", 190, 40, { align: "right" });
    doc.text("Mr le Directeur " + CONFIG.companyName, 190, 47, { align: "right" });

    doc.text("Objet : lettre d’intention d’achat", 20, 65);

    doc.setFont("times", "normal");
    var p1 = "Nous soussignée la société " + societeClient + ", représentée par " + nomClient + ", venons par la présente, vous soumettre notre intention d’achat.";
    doc.text(doc.splitTextToSize(p1, 170), 20, 80);

    var p2 = "En effet, dans le cadre de nos activités à " + value("ville") + " (" + value("pays") + "), nous souhaitons acquérir des véhicules industriels.";
    doc.text(doc.splitTextToSize(p2, 170), 20, 95);

    var p3 = "Au vue de ce qui précède monsieur, nous vous faisons suivre les différentes caractéristiques des camions faisant objet de notre intention d’achat :";
    doc.text(doc.splitTextToSize(p3, 170), 20, 110);

    doc.setFont("times", "bold");
    var pPuce = "-" + value("quantite") + " " + truck.name + " de marque " + truck.brand + " (" + truck.category + ") Réf: " + truck.id + ". " + precision;
    doc.text(doc.splitTextToSize(pPuce, 165), 25, 125);

    doc.setFont("times", "normal");
    doc.text("Contact client : " + value("telephone") + " | " + value("email"), 25, 145);

    var p4 = "Vous remerciant de la bonne réception de notre sollicitude, veuillez agréer monsieur, l’expression de notre profond respect.";
    doc.text(doc.splitTextToSize(p4, 170), 20, 165);

    doc.setFont("times", "bold");
    doc.text("LA DIRECTRICE / LE DIRECTEUR", 190, 195, { align: "right" });

    var fileName = "Lettre_Intention_Achat_" + societeClient.replace(/\s+/g, '_') + ".pdf";
    doc.save(fileName);

    return fileName;
  }
});