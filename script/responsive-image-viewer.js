/**
 * Module d'affichage d'images adaptatif
 * Adapte automatiquement l'affichage des images à la taille de l'écran
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour adapter l'affichage lors du redimensionnement de la fenêtre
    function handleWindowResize() {
        const modal = document.querySelector('.image-modal');
        const modalImg = document.getElementById('modal-img');
        
        // Ne rien faire si le modal n'est pas affiché ou si l'image n'est pas chargée
        if (modal.style.display !== 'flex' || !modalImg.complete) {
            return;
        }
        
        // Récupérer les dimensions naturelles de l'image
        const imgWidth = modalImg.naturalWidth;
        const imgHeight = modalImg.naturalHeight;
        
        // Calculer le zoom optimal en fonction de la taille actuelle de l'écran
        const screenWidth = window.innerWidth * 0.85;
        const screenHeight = window.innerHeight * 0.85;
        
        // Calculer les ratios
        const widthRatio = screenWidth / imgWidth;
        const heightRatio = screenHeight / imgHeight;
        
        // Détecter si l'image est en portrait (plus haute que large)
        const isPortrait = imgHeight > imgWidth;
        
        // Calculer le zoom optimal selon l'orientation de l'image
        let optimalZoom;
        
        if (isPortrait) {
            // Pour les images en portrait, privilégier la hauteur
            optimalZoom = heightRatio * 0.9;
            
            // S'assurer que l'image ne dépasse pas en largeur
            if (imgWidth * optimalZoom > screenWidth) {
                optimalZoom = widthRatio;
            }
        } else {
            // Pour les images en paysage, utiliser le ratio le plus petit
            optimalZoom = Math.min(widthRatio, heightRatio);
        }
        
        // Ajustements supplémentaires
        if (window.innerWidth < 768) {
            // Sur mobile, ajuster selon l'orientation
            if (isPortrait && window.innerHeight > window.innerWidth) {
                // Mobile en portrait avec image portrait: optimiser la hauteur
                optimalZoom = heightRatio * 0.85;
            } else {
                // Autres cas sur mobile
                optimalZoom *= 0.95;
            }
        } else if (imgWidth < screenWidth / 2 && imgHeight < screenHeight / 2) {
            // Si l'image est très petite par rapport à l'écran, l'agrandir un peu
            optimalZoom = Math.min(1.5, optimalZoom * 1.5);
        }
        
        // Appliquer le zoom calculé (en préservant la rotation actuelle)
        const currentRotation = parseInt(modalImg.style.transform.match(/rotate\((\d+)deg\)/) ? 
                                        modalImg.style.transform.match(/rotate\((\d+)deg\)/)[1] : 0);
        
        modalImg.style.transform = `scale(${optimalZoom}) rotate(${currentRotation}deg)`;
        
        // Mettre à jour la variable globale de zoom si elle existe
        if (window.currentZoom !== undefined) {
            window.currentZoom = optimalZoom;
        }
    }
    
    // Écouter les événements de redimensionnement de la fenêtre
    window.addEventListener('resize', handleWindowResize);
    
    // Écouter l'événement d'orientation pour les appareils mobiles
    window.addEventListener('orientationchange', function() {
        // Attendre un court instant pour que le navigateur termine le changement d'orientation
        setTimeout(handleWindowResize, 100);
    });
    
    console.log("Module d'affichage d'images adaptatif chargé");
});