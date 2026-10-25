# Site vitrine de camions — projet statique

## Arborescence

- `index.html` : accueil
- `catalogue.html` : catalogue et filtres
- `camion.html` : fiche chargée avec `?id=camion-001`
- `commande.html` : demande de devis, lettre récapitulative et canaux d’envoi
- `a-propos.html`, `contact.html`
- `css/style.css` : toute la présentation responsive
- `js/config.js` : coordonnées centralisées
- `js/data.js` : véhicules de démonstration
- `js/*.js` : comportements de chaque page
- `assets/images/` : illustrations SVG locales

## Ouvrir le site

Double-cliquez sur `index.html` ou ouvrez-le dans un navigateur récent. Aucune installation, compilation, dépendance ou connexion Internet n’est nécessaire.

## Modifier les coordonnées

Ouvrez `js/config.js` et remplacez les cinq valeurs entre crochets. Le numéro WhatsApp doit contenir uniquement les chiffres du format international, sans `+`, espace ou parenthèse. Exemple de format (non utilisable tel quel) : `CODEPAYSNUMERO`.

Tant que WhatsApp ou l’e-mail restent des placeholders, les actions concernées sont bloquées et un message explique la configuration nécessaire.

## Ajouter ou modifier un camion

Dans `js/data.js`, dupliquez un objet du tableau `TRUCKS`, puis modifiez :

- `id` : identifiant unique ;
- `brand`, `name`, `category`, `description` ;
- `specs` : caractéristiques affichées ;
- `image` : chemin du visuel local ;
- `remoteImage` : URL `https://…` facultative.

Une image distante est utilisée seulement si `remoteImage` est rempli. Si son chargement échoue, le SVG local défini dans `image` prend automatiquement le relais.

## Remplacer les images

Placez vos fichiers dans `assets/images/`, puis modifiez `image` dans `js/data.js`. Pour une photo distante, renseignez `remoteImage`. Utilisez des noms sans espaces et des images optimisées. Conservez un visuel local pour la présentation hors ligne.

## Demandes WhatsApp et e-mail

Le formulaire valide les champs, génère une lettre formelle et permet de l’imprimer ou de l’enregistrer en PDF via la boîte d’impression du navigateur.

- WhatsApp ouvre `https://wa.me/NUMERO?text=MESSAGE`.
- E-mail ouvre un lien `mailto:` avec destinataire, objet et corps.

Dans les deux cas, le client doit vérifier puis confirmer lui-même l’envoi. Un navigateur ne peut pas joindre automatiquement le PDF à WhatsApp ou à un e-mail depuis ce site statique : le client peut enregistrer le PDF puis l’ajouter manuellement.

## Limites du site statique

- Aucun paiement ni confirmation définitive de commande.
- Aucun envoi automatique, stockage de données ou suivi serveur.
- Le fonctionnement de `mailto:` dépend d’une application de messagerie configurée.
- La disponibilité, les prix, les caractéristiques et la livraison doivent être confirmés hors du site.

## Tests manuels conseillés

1. Ouvrir chaque lien du menu sur ordinateur et mobile.
2. Tester recherche, marque, catégorie, combinaison des filtres et état vide.
3. Ouvrir une fiche depuis le catalogue, puis tester un identifiant inconnu.
4. Vérifier la présélection du véhicule dans la demande.
5. Soumettre des champs vides, des espaces, un e-mail invalide et une quantité décimale.
6. Générer la lettre et contrôler les accents, retours à la ligne et données.
7. Configurer temporairement vos vraies coordonnées, puis tester WhatsApp et e-mail sans confirmer l’envoi.
8. Tester la copie, son repli manuel et l’enregistrement en PDF.
9. Couper Internet et vérifier les illustrations locales.
10. Naviguer uniquement au clavier et tester le menu mobile.
