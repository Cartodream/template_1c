/**
 * Intégration de ResponsiveVoice pour une synthèse vocale de haute qualité
 * Solution similaire à ReadSpeaker utilisé sur service-public.fr
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si ResponsiveVoice est chargé
    if (typeof responsiveVoice === 'undefined') {
        console.error("ResponsiveVoice n'est pas chargé");
        return;
    }
    
    // Remplacer la fonction speakText originale
    window.originalSpeakText = window.speakText;
    window.speakText = function(text, button) {
        // Si déjà en train de parler, on arrête
        if (window.isSpeaking) {
            responsiveVoice.cancel();
            window.isSpeaking = false;
            
            // Réinitialiser tous les boutons de lecture
            document.querySelectorAll('.speak-button').forEach(btn => {
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
                btn.classList.remove('speaking');
            });
            
            return;
        }
        
        // Changer l'apparence du bouton
        button.innerHTML = '<i class="fas fa-pause"></i> Pause';
        button.classList.add('speaking');
        
        // Activer l'indicateur de volume s'il existe
        const volumeIndicator = button.nextElementSibling;
        if (volumeIndicator && volumeIndicator.classList.contains('volume-indicator')) {
            volumeIndicator.classList.add('active');
        }
        
        // Paramètres pour une voix de haute qualité
        const parameters = {
            pitch: 1,
            rate: 0.9,
            volume: 1,
            onend: function() {
                window.isSpeaking = false;
                button.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
                button.classList.remove('speaking');
                
                // Désactiver l'indicateur de volume
                if (volumeIndicator) {
                    volumeIndicator.classList.remove('active');
                }
            },
            onerror: function() {
                window.isSpeaking = false;
                button.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
                button.classList.remove('speaking');
                
                // Désactiver l'indicateur de volume
                if (volumeIndicator) {
                    volumeIndicator.classList.remove('active');
                }
            }
        };
        
        // Lire le texte avec ResponsiveVoice
        responsiveVoice.speak(text, "French Female", parameters);
        window.isSpeaking = true;
    };
    
    console.log("Module ResponsiveVoice chargé avec succès");
});