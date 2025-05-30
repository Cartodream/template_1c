/**
 * Script simplifié pour l'affichage des images
 */

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const modal = document.querySelector('.image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const imageCaption = document.querySelector('.image-caption');
    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const rotateBtn = document.querySelector('.rotate');
    
    // Variables
    let currentZoom = 1;
    let currentRotation = 0;
    
    // Fermer le modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fermer le modal en cliquant en dehors de l'image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Zoom in
    zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom += 0.2;
        if (currentZoom > 5) currentZoom = 5;
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
    });
    
    // Zoom out
    zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom -= 0.2;
        if (currentZoom < 0.2) currentZoom = 0.2;
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
    });
    
    // Rotation
    rotateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentRotation += 90;
        if (currentRotation >= 360) currentRotation = 0;
        modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
    });
    
    // Ouvrir l'image en grand
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('popup-thumbnail')) {
            const fullImgSrc = event.target.getAttribute('data-full-img');
            const imgTitle = event.target.getAttribute('alt') || 'Image';
            
            // Réinitialiser le zoom et la rotation
            currentZoom = 1;
            currentRotation = 0;
            modalImg.style.transform = '';
            
            // Afficher l'image
            modalImg.src = fullImgSrc;
            imageCaption.textContent = imgTitle;
            modal.style.display = 'block';
        }
    });
    
    // Navigation par clavier
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            } else if (e.key === '+' || e.key === '=') {
                currentZoom += 0.2;
                if (currentZoom > 5) currentZoom = 5;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            } else if (e.key === '-' || e.key === '_') {
                currentZoom -= 0.2;
                if (currentZoom < 0.2) currentZoom = 0.2;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            } else if (e.key === 'r') {
                currentRotation += 90;
                if (currentRotation >= 360) currentRotation = 0;
                modalImg.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
            }
        }
    });
});