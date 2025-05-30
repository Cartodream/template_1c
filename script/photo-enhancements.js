/**
 * Améliorations pour l'affichage des photos
 * Ce script améliore l'affichage des photos dans les popups et la fenêtre d'agrandissement
 */

document.addEventListener('DOMContentLoaded', function() {
    // Variables pour la fenêtre modale
    const modal = document.querySelector('.image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const imageCaption = document.querySelector('.image-caption');
    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const rotateBtn = document.querySelector('.rotate');
    
    // Variables globales pour permettre l'accès depuis d'autres scripts
    window.currentZoom = 1;
    window.currentRotation = 0;
    window.currentImageTitle = '';
    
    // Références locales pour faciliter l'accès
    let currentZoom = window.currentZoom;
    let currentRotation = window.currentRotation;
    let currentImageTitle = window.currentImageTitle;
    
    // Fonction pour réinitialiser les transformations
    function resetImageTransforms() {
        currentZoom = 1;
        currentRotation = 0;
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        // Déclencher un événement personnalisé pour informer les autres scripts
        const event = new CustomEvent('imageReset', { detail: { zoom: currentZoom, rotation: currentRotation } });
        document.dispatchEvent(event);
    }
    
    // Fermer le modal au clic sur le bouton de fermeture
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        resetImageTransforms();
    });
    
    // Fermer le modal au clic en dehors de l'image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetImageTransforms();
        }
    });
    
    // Zoom in
    zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom += 0.2;
        if (currentZoom > 5) currentZoom = 5; // Limite de zoom augmentée
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        // Rendre la variable accessible globalement pour d'autres scripts
        window.currentZoom = currentZoom;
    });
    
    // Zoom out
    zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom -= 0.2;
        if (currentZoom < 0.2) currentZoom = 0.2; // Limite de zoom diminuée
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        // Rendre la variable accessible globalement pour d'autres scripts
        window.currentZoom = currentZoom;
    });
    
    // Rotation
    rotateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentRotation += 90;
        if (currentRotation >= 360) currentRotation = 0;
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        // Rendre la variable accessible globalement pour d'autres scripts
        window.currentRotation = currentRotation;
    });
    
    // Améliorer les images dans les popups Leaflet
    function enhancePopupImages() {
        // Délégation d'événements pour les images dans les popups
        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('popup-thumbnail')) {
                const fullImgSrc = event.target.getAttribute('data-full-img');
                const imgTitle = event.target.getAttribute('alt') || 'Image';
                
                // Précharger l'image pour obtenir ses dimensions réelles
                const tempImg = new Image();
                tempImg.onload = function() {
                    modalImg.src = fullImgSrc;
                    imageCaption.textContent = imgTitle;
                    currentImageTitle = imgTitle;
                    modal.style.display = 'flex';
                    resetImageTransforms();
                    
                    // Calculer le zoom optimal en fonction de la taille de l'écran et de l'image
                    const screenWidth = window.innerWidth * 0.85; // 85% de la largeur de l'écran
                    const screenHeight = window.innerHeight * 0.85; // 85% de la hauteur de l'écran
                    
                    // Calculer les ratios
                    const widthRatio = screenWidth / tempImg.width;
                    const heightRatio = screenHeight / tempImg.height;
                    
                    // Détecter si l'image est en portrait (plus haute que large)
                    const isPortrait = tempImg.height > tempImg.width;
                    
                    // Pour les images en portrait, privilégier la hauteur
                    if (isPortrait) {
                        // Utiliser 90% du ratio de hauteur pour les images portrait
                        currentZoom = heightRatio * 0.9;
                        
                        // S'assurer que l'image ne dépasse pas en largeur
                        if (tempImg.width * currentZoom > screenWidth) {
                            currentZoom = widthRatio;
                        }
                    } else {
                        // Pour les images en paysage, utiliser le ratio le plus petit
                        currentZoom = Math.min(widthRatio, heightRatio);
                    }
                    
                    // Ajustements supplémentaires
                    if (window.innerWidth < 768) {
                        // Sur mobile, ajuster selon l'orientation
                        if (isPortrait && window.innerHeight > window.innerWidth) {
                            // Mobile en portrait avec image portrait: optimiser la hauteur
                            currentZoom = heightRatio * 0.85;
                        } else {
                            // Autres cas sur mobile
                            currentZoom *= 0.95;
                        }
                    } else if (tempImg.width < screenWidth / 2 && tempImg.height < screenHeight / 2) {
                        // Si l'image est très petite par rapport à l'écran, l'agrandir un peu
                        currentZoom = Math.min(1.5, currentZoom * 1.5);
                    }
                    
                    // Appliquer le zoom calculé
                    modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
                };
                tempImg.src = fullImgSrc;
            }
        });
    }
    
    // Améliorer la création des popups pour les POIs
    function enhancePopupCreation() {
        // Cette fonction sera appelée si nous avons accès aux fonctions de création de popup
        if (window.loadPOIs) {
            const originalLoadPOIs = window.loadPOIs;
            
            window.loadPOIs = function() {
                originalLoadPOIs.apply(this, arguments);
                
                // Améliorer les images après le chargement des POIs
                setTimeout(function() {
                    document.querySelectorAll('.popup-image').forEach(function(imageContainer) {
                        const img = imageContainer.querySelector('img');
                        if (img) {
                            // Ajouter une classe pour l'effet de zoom
                            img.classList.add('enhanced-image');
                            
                            // S'assurer que l'attribut alt est défini
                            if (!img.getAttribute('alt') || img.getAttribute('alt') === '') {
                                img.setAttribute('alt', 'Point d\'intérêt');
                            }
                        }
                    });
                }, 500);
            };
        }
    }
    
    // Navigation par clavier
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                resetImageTransforms();
            } else if (e.key === '+' || e.key === '=') {
                currentZoom += 0.1;
                if (currentZoom > 3) currentZoom = 3;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            } else if (e.key === '-' || e.key === '_') {
                currentZoom -= 0.1;
                if (currentZoom < 0.5) currentZoom = 0.5;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            } else if (e.key === 'r') {
                currentRotation += 90;
                if (currentRotation >= 360) currentRotation = 0;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            }
        }
    });
    
    // Initialisation
    enhancePopupImages();
    enhancePopupCreation();
    
    console.log("Module d'amélioration des photos chargé avec succès");
});