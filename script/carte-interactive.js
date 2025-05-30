// Variables globales
let map;
let markers = L.markerClusterGroup({
    showCoverageOnHover: false // Désactiver l'affichage du polygone au survol
});
let allMarkers = {};
let categoryFilters = {};
let rivieresLayer; // Couche pour les rivières
let bassinVesgreLayer; // Couche pour le bassin de la Vesgre
let bassinVaucouleursLayer; // Couche pour le bassin de la Vaucouleurs

// Variables pour le diaporama
let currentSlideIndex = 0;
let slideImages = [];

// Initialisation de la carte
function initMap() {
    
    // Création de la carte
    map = L.map('map', {
        center: [48.81826349423801, 1.6032443265782088],
        zoom: 11,
        zoomControl: false,
        maxZoom: 20,
        scrollWheelZoom: true // Activer le zoom par molette
    });

    // Ajout du fond de carte OpenStreetMap
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Cartographie : <a href="https://informatique-m2i.fr/">M2i informatique </a>,Cartographie : <a href="https://www.linkedin.com/in/alexandreponchon/">Alexandre PONCHON </a> , <a href="https://www.openstreetmap.fr/">OSM</a>, iconographie : <a href="https://www.flaticon.com/fr/">Flaticon</a>'
    }).addTo(map);

    // Ajout des contrôles de zoom
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Ajout de l'échelle
    L.control.scale({
        position: 'bottomright',
        imperial: false
    }).addTo(map);

    // Ajout du périmètre (fond)
    if (typeof afond !== 'undefined') {
        const fondStyle = {
            weight: 2,
            opacity: 1,
            color: '#9f5cc0',
            fillColor: '#9f5cc0',
            fillOpacity: 0.2,
            interactive: false
        };

        L.geoJSON(afond, {
            style: fondStyle
        }).addTo(map);
    }
    
    // Initialisation de la couche du bassin de la Vesgre
    if (typeof json_COMMUNE_0 !== 'undefined') {
        bassinVesgreLayer = L.geoJSON(json_COMMUNE_0, {
            style: {
                fillColor: "#bdc05c",
                weight: 1,
                opacity: 0.5,
                color: "#bdc05c",
                fillOpacity: 0.5
            }
        });
    }
    // Initialisation de la couche du bassin de la Vaucouleurs
    if (typeof json_COMMUNE_1 !== 'undefined') {
        bassinVaucouleursLayer = L.geoJSON(json_COMMUNE_1, {
            style: {
                fillColor: "#306636",
                weight: 1,
                opacity: 0.5,
                color: "#306636",
                fillOpacity: 0.5
            }
        });
    }
    // Ajout des sentiers/rivières
    if (typeof rivieres_opth !== 'undefined') {
        const sentierStyle = {
            weight: 4,
            opacity: 1,
            color: '#3388ff',
            fillOpacity: 0
        };

        rivieresLayer = L.geoJSON(rivieres_opth, {
            style: sentierStyle,
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.nom) {
                    let popupContent = `<h3>${feature.properties.nom}</h3>`;
                    
                    // Conteneur pour la mise en page à deux colonnes
                    popupContent += `<div class="popup-container">`;
                    
                    // Colonne de gauche pour le descriptif
                    popupContent += `<div class="popup-text">`;
                    if (feature.properties.descriptif) {
                        popupContent += `<p>${feature.properties.descriptif}</p>`;
                    }
                    popupContent += `</div>`;
                    
                    // Colonne de droite pour l'image
                    if (feature.properties.photo) {
                        popupContent += `
                            <div class="popup-image">
                                <img src="${feature.properties.photo}" alt="${feature.properties.nom}" class="popup-thumbnail" data-full-img="${feature.properties.photo}">
                            </div>
                        `;
                    } else {
                        // Si pas d'image, ajuster l'espace pour le texte
                        popupContent = popupContent.replace('<div class="popup-text">', '<div class="popup-text" style="width:100%">');
                    }
                    
                    popupContent += `</div>`; // Fin du conteneur à deux colonnes
                    
                    // Section pour les liens
                    popupContent += `<div class="popup-links">`;
                    if (feature.properties.site_web) {
                        popupContent += `<p><a href="${feature.properties.site_web}" target="_blank">Plus d'informations</a></p>`;
                    }
                    if (feature.properties.accessibilité) {
                        popupContent += `<p><strong>Accessible :</strong> ${feature.properties.accessibilité}</p>`;
                    }
                    popupContent += `</div>`;
                    
                    layer.bindPopup(popupContent);
                }
            }
        });
        
        // Les rivières sont maintenant gérées par le filtre "Etangs et Rivières"
        if (!categoryFilters['activites']) {
            categoryFilters['activites'] = {};
        }
        categoryFilters['activites']['nature'] = false;
    }

    // Chargement des points d'intérêt
    loadPOIs();
}

// Fonction pour charger les points d'intérêt
function loadPOIs() {
    if (typeof poi === 'undefined') {
        console.error("Les données POI ne sont pas disponibles");
        return;
    }

    // Parcourir tous les POIs
    poi.features.forEach(feature => {
        // Création de l'icône personnalisée
        const icon = createCustomIcon(feature.properties.sous_cat);
        
        // Création du marqueur
        const marker = L.marker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
            { icon: icon }
        );
        
        // Création du contenu de la popup
        let popupContent = `<h3>${feature.properties.nom}</h3>`;
        
        // Conteneur pour la mise en page à deux colonnes
        popupContent += `<div class="popup-container">`;
        
        // Colonne de gauche pour le descriptif
        popupContent += `<div class="popup-text">`;
        if (feature.properties.descriptif) {
            popupContent += `<p>${feature.properties.descriptif}</p>`;
        }
        popupContent += `</div>`;
        
        // Colonne de droite pour l'image
        if (feature.properties.photo) {
            popupContent += `
                <div class="popup-image">
                    <img src="${feature.properties.photo}" alt="${feature.properties.nom}" class="popup-thumbnail" 
                         data-full-img="${feature.properties.photo}" 
                         data-photo2="${feature.properties.photo2 || ''}">
                </div>
            `;
        } else {
            // Si pas d'image, ajuster l'espace pour le texte
            popupContent = popupContent.replace('<div class="popup-text">', '<div class="popup-text" style="width:100%">');
        }
        
        popupContent += `</div>`; // Fin du conteneur à deux colonnes
        
        // Section pour les liens et informations supplémentaires
        popupContent += `<div class="popup-links">`;
        
        if (feature.properties.tel) {
            popupContent += `<p><strong>Tél :</strong> ${feature.properties.tel}</p>`;
        }
        
        if (feature.properties.mail) {
            popupContent += `<p><strong>Email :</strong> ${feature.properties.mail}</p>`;
        }
        
        if (feature.properties.site_web) {
            popupContent += `<p><a href="${feature.properties.site_web}" target="_blank">Plus d'informations</a></p>`;
        }
        
        if (feature.properties.accessibilité) {
            popupContent += `<p><strong>Accessible :</strong> ${feature.properties.accessibilité}</p>`;
        }
        
        if (feature.properties.Latitude && feature.properties.Longitude) {
            popupContent += `<p><a href="https://www.google.com/maps/dir//${feature.properties.Latitude},${feature.properties.Longitude}" target="_blank">Itinéraire</a></p>`;
        }
        
        popupContent += `</div>`; // Fin de la section des liens
        
        // Liaison de la popup au marqueur
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            minWidth: 200,
            closeOnClick: true,
            autoClose: true
        });
        
        
          // Ajouter un événement pour afficher le bassin de la Vaucouleurs quand on clique sur le POI correspondant
        if (feature.properties.nom === "Orchidées sauvages - Bassin de la Vaucouleurs") {
            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                if (bassinVaucouleursLayer) {
                    // Retirer temporairement le marqueur du cluster
                    markers.removeLayer(marker);
                    // Ajouter le marqueur directement à la carte
                    marker.addTo(map);
                    // Ajouter la couche du bassin
                    map.addLayer(bassinVaucouleursLayer);
                    // Ouvrir d'abord le popup
                    marker.openPopup();
                    // Puis ajuster la vue avec un délai pour éviter les conflits
                    setTimeout(function() {
                        // Utiliser {animate: false} pour éviter les problèmes avec le popup
                        map.fitBounds(bassinVaucouleursLayer.getBounds(), {animate: false});
                        // S'assurer que le popup reste ouvert après le zoom
                        if (!marker.isPopupOpen()) {
                            marker.openPopup();
                        }
                    }, 100);
                }
            });
            
            marker.on('popupclose', function() {
                if (bassinVaucouleursLayer && map.hasLayer(bassinVaucouleursLayer)) {
                    map.removeLayer(bassinVaucouleursLayer);
                }
                // Remettre le marqueur dans le cluster
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                    markers.addLayer(marker);
                }
            });
        }
        // Ajouter un événement pour afficher le bassin de la Vesgre quand on clique sur le POI correspondant
        if (feature.properties.nom === "Orchidées sauvages - Bassin de la Vesgre") {
            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                if (bassinVesgreLayer) {
                    // Retirer temporairement le marqueur du cluster
                    markers.removeLayer(marker);
                    // Ajouter le marqueur directement à la carte
                    marker.addTo(map);
                    // Ajouter la couche du bassin
                    map.addLayer(bassinVesgreLayer);
                    // Ouvrir d'abord le popup
                    marker.openPopup();
                    // Puis ajuster la vue avec un délai pour éviter les conflits
                    setTimeout(function() {
                        // Utiliser {animate: false} pour éviter les problèmes avec le popup
                        map.fitBounds(bassinVesgreLayer.getBounds(), {animate: false});
                        // S'assurer que le popup reste ouvert après le zoom
                        if (!marker.isPopupOpen()) {
                            marker.openPopup();
                        }
                    }, 100);
                }
            });
            
            marker.on('popupclose', function() {
                if (bassinVesgreLayer && map.hasLayer(bassinVesgreLayer)) {
                    map.removeLayer(bassinVesgreLayer);
                }
                // Remettre le marqueur dans le cluster
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                    markers.addLayer(marker);
                }
            });
        }
        // Stockage du marqueur avec ses catégories pour le filtrage
        const category = mapToFilterCategory(feature.properties.categorie);
        const subcategory = mapToFilterSubcategory(feature.properties.sous_cat);
        
        if (!allMarkers[category]) {
            allMarkers[category] = {};
        }
        
        if (!allMarkers[category][subcategory]) {
            allMarkers[category][subcategory] = [];
        }
        
        allMarkers[category][subcategory].push(marker);
        
        // Ajout du marqueur au cluster
        markers.addLayer(marker);
    });
    
    // Ajout du cluster à la carte
    map.addLayer(markers);
    
    // Initialisation des filtres
    initFilters();
    
    // Mise à jour des marqueurs pour appliquer les filtres initiaux
    updateMarkers();
}

// Fonction pour créer une icône personnalisée
function createCustomIcon(category) {
    // Normalisation du nom de catégorie pour correspondre au nom de fichier
    const iconName = normalizeString(category);
    
    return L.icon({
        iconUrl: `image/${iconName}.png`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
}

// Fonction pour normaliser une chaîne (pour les noms de fichiers d'icônes)
function normalizeString(str) {
    if (!str) return 'default';
    
    return str.toLowerCase()
        .replace(/ /g, '_')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/'/g, '');
}

// Fonction pour mapper les catégories du jeu de données aux catégories de filtres
function mapToFilterCategory(category) {
    const categoryMap = {
        'Patrimoine Architectural': 'activites',
        'Patrimoine Naturel': 'activites',
        'Autres Points': 'activites',
        // Ajoutez d'autres mappings selon vos données
    };
    
    return categoryMap[category] || 'activites';
}

// Fonction pour mapper les sous-catégories du jeu de données aux sous-catégories de filtres
function mapToFilterSubcategory(subcategory) {
    const subcategoryMap = {
        'Patrimoine bâti monumental': 'patrimoine',
        'Patrimoine Religieux': 'religieux',
        'Bâti Traditionnel': 'traditionnel',
        'Etangs et Rivières': 'nature',
        'Etangs': 'nature',
        'Rivières': 'nature',
        'Flore': 'flore',
        'Forêts et Parcs': 'forets_et_parcs',
        'Rapace': 'rapace',
        'Heron': 'heron',
        'Effraie': 'effraie',
        'Chevêche': 'cheveche',
        'Chauve Souris': 'chauve',
        'Cervidés': 'cervides',
        'Hirondelle': 'hirondelle',
        'Curiosité': 'curiosite',
        // Ajoutez d'autres mappings selon vos données
    };
    
    return subcategoryMap[subcategory] || 'default';
}

// Initialisation des filtres
function initFilters() {
    // Sélection de toutes les cases à cocher de filtre
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    
    // Liste des sous-catégories de "Patrimoine Naturel"
    const patrimoineNaturelSubcategories = [
        "nature", "effraie", "cheveche", "flore", "rapace", 
        "heron", "forets_et_parcs", "chauve", "cervides", "hirondelle"
    ];
    
    // Cocher toutes les cases par défaut, sauf celles de la catégorie "Patrimoine Naturel"
    filterCheckboxes.forEach(checkbox => {
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        // Vérifier si la sous-catégorie appartient à "Patrimoine Naturel"
        const isPatrimoineNaturel = patrimoineNaturelSubcategories.includes(subcategory);
        checkbox.checked = !isPatrimoineNaturel;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = !isPatrimoineNaturel;
    });
    
    // Ajout des écouteurs d'événements pour les cases à cocher
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const category = this.dataset.category;
            const subcategory = this.dataset.subcategory;
            
            if (!categoryFilters[category]) {
                categoryFilters[category] = {};
            }
            
            categoryFilters[category][subcategory] = this.checked;
            
            updateMarkers();
        });
    });
    
    // Écouteurs pour les boutons "Tout sélectionner" et "Tout désélectionner"
    document.querySelector('.select-all').addEventListener('click', selectAllFilters);
    document.querySelector('.deselect-all').addEventListener('click', deselectAllFilters);
    
    // Écouteurs pour les titres de groupes de filtres (accordéon)
    document.querySelectorAll('.filter-title').forEach(title => {
        title.addEventListener('click', function() {
            this.classList.toggle('active');
            const options = this.nextElementSibling;
            options.style.display = options.style.display === 'none' ? 'flex' : 'none';
        });
    });
    
    // Écouteur pour le bouton d'affichage/masquage des filtres (mobile)
    document.querySelector('.toggle-filters-btn').addEventListener('click', function() {
        document.querySelector('.filters-panel').classList.add('active');
    });
    
    // Écouteur pour le bouton de fermeture des filtres (mobile)
    document.querySelector('.close-filters').addEventListener('click', function() {
        document.querySelector('.filters-panel').classList.remove('active');
    });
}

// Mise à jour des marqueurs selon les filtres
function updateMarkers() {
    // Supprimer tous les marqueurs
    markers.clearLayers();
    
    // Parcourir toutes les catégories et sous-catégories
    for (const category in allMarkers) {
        for (const subcategory in allMarkers[category]) {
            // Vérifier si cette catégorie/sous-catégorie est activée
            if (categoryFilters[category] && categoryFilters[category][subcategory]) {
                // Ajouter tous les marqueurs de cette sous-catégorie
                allMarkers[category][subcategory].forEach(marker => {
                    markers.addLayer(marker);
                });
            }
        }
    }
    
    // Gérer l'affichage des rivières
    if (rivieresLayer) {
        if (categoryFilters['activites'] && categoryFilters['activites']['nature']) {
            if (!map.hasLayer(rivieresLayer)) {
                map.addLayer(rivieresLayer);
            }
        } else {
            if (map.hasLayer(rivieresLayer)) {
                map.removeLayer(rivieresLayer);
            }
        }
    }
}

// Réinitialisation des filtres
function resetFilters() {
    // Cocher toutes les cases
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = true;
    });
    
    // Mettre à jour les marqueurs
    updateMarkers();
}

// Sélectionner tous les filtres
function selectAllFilters() {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = true;
    });
    
    updateMarkers();
}

// Désélectionner tous les filtres
function deselectAllFilters() {
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        
        const category = checkbox.dataset.category;
        const subcategory = checkbox.dataset.subcategory;
        
        if (!categoryFilters[category]) {
            categoryFilters[category] = {};
        }
        
        categoryFilters[category][subcategory] = false;
    });
    
    updateMarkers();
}

// Fonction pour gérer l'agrandissement des images
function setupImageModal() {
    const modal = document.querySelector('.image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const slideshowControls = document.querySelector('.slideshow-controls');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const slideCounter = document.querySelector('.slide-counter');
    
    // Fermer le modal au clic sur le bouton de fermeture
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fermer le modal au clic en dehors de l'image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Navigation dans le diaporama
    prevButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (slideImages.length <= 1) return;
        
        // Basculer entre les deux images (0 et 1)
        currentSlideIndex = currentSlideIndex === 1 ? 0 : 0;
        modalImg.src = slideImages[currentSlideIndex];
        slideCounter.textContent = `1/${slideImages.length}`;
    });
    
    nextButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (slideImages.length <= 1) return;
        
        // Basculer entre les deux images (0 et 1)
        currentSlideIndex = currentSlideIndex === 0 ? 1 : 1;
        modalImg.src = slideImages[currentSlideIndex];
        slideCounter.textContent = `2/${slideImages.length}`;
    });
    
    // Délégation d'événements pour les images dans les popups
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('popup-thumbnail')) {
            const img1 = event.target.getAttribute('data-full-img');
            const img2 = event.target.getAttribute('data-photo2');
            
            slideImages = [img1];
            if (img2 && img2 !== '') {
                slideImages.push(img2);
            }
            
            currentSlideIndex = 0;
            modalImg.src = slideImages[0];
            modal.style.display = 'flex';
            
            if (slideImages.length > 1) {
                slideshowControls.style.display = 'flex';
                slideCounter.textContent = `1/${slideImages.length}`;
            } else {
                slideshowControls.style.display = 'none';
            }
        }
    });
}



// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    setupImageModal();
    
    // Gestion du menu mobile
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            document.querySelector('.main-nav').classList.toggle('active');
            document.querySelector('.header-actions').classList.toggle('active');
        });
    }
});