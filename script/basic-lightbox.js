document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const modal = document.querySelector('.image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const imageCaption = document.querySelector('.image-caption');
    
    // Fermer le modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fermer le modal en cliquant en dehors de l'image
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Ouvrir l'image en grand
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('popup-thumbnail')) {
            const fullImgSrc = event.target.getAttribute('data-full-img');
            const imgTitle = event.target.getAttribute('alt') || 'Image';
            
            modalImg.src = fullImgSrc;
            imageCaption.textContent = imgTitle;
            modal.style.display = 'block';
        }
    });
    
    // Navigation par clavier
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block' && e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
});