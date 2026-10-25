"use strict";

var CONFIG = {
  companyName: "GROUP 10 TRUCKING",
  whatsapp: "237659011729",
  email: "info@trucksafrica.com",
  address: "www.trucksafrica.com",
  address1: "client.trucksafrica.com",
  city: "DOUALA, CAMEROUN",
  hours: "Monday - Saturday | 8H - 18H | 24H/6 "
};

function isPlaceholder(value) {
  return !value || /^\[.+\]$/.test(String(value).trim());
}

function hasValidWhatsapp() {
  return !isPlaceholder(CONFIG.whatsapp) && /^\d{8,15}$/.test(CONFIG.whatsapp);
}

function hasValidCompanyEmail() {
  return !isPlaceholder(CONFIG.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.email);
}
