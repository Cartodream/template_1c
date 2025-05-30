/**
 * Correctif spécifique pour les images en format portrait
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour détecter et ajuster les images en portrait
    function handlePortraitImages() {
        const modal = document.querySelector('.image-modal');
        const modalImg = document.getElementById('modal-img');
        
        // Attendre que l'image soit chargée
        modalImg.addEventListener('load', function() {
            // Vérifier si l'image est en format portrait
            const isPortrait = this.naturalHeight > this.naturalWidth;
            
            if (isPortrait) {
                // Ajouter une classe spécifique pour les images portrait
                modalImg.classList.add('portrait-image');
                
                // Calculer le zoom optimal pour les images portrait
                const screenHeight = window.innerHeight * 0.85;
                const heightRatio = screenHeight / this.naturalHeight;
                
                // Appliquer un zoom spécifique pour les images portrait
                // tout en préservant la rotation actuelle
                const currentRotation = parseInt(modalImg.style.transform.match(/rotate\((\d+)deg\)/) ? 
                                              modalImg.style.transform.match(/rotate\((\d+)deg\)/)[1] : 0);
                
                // Utiliser un délai court pour s'assurer que l'image est bien rendue
                setTimeout(() => {
                    // Appliquer un zoom légèrement plus important pour les images portrait
                    const portraitZoom = heightRatio * 0.95;
                    modalImg.style.transform = `scale(${portraitZoom}) rotate(${currentRotation}deg)`;
                    
                    // Mettre à jour la variable globale de zoom si elle existe
                    if (window.currentZoom !== undefined) {
                        window.currentZoom = portraitZoom;
                    }
                }, 50);
            } else {
                // Retirer la classe si ce n'est pas une image portrait
                modalImg.classList.remove('portrait-image');
            }
        });
    }
    
    // Initialiser le correctif
    handlePortraitImages();
});