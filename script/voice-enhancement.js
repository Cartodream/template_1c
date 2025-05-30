/**
 * Module d'amélioration de la synthèse vocale
 * Ce script remplace la fonction de synthèse vocale standard par une version améliorée
 * qui utilise des voix de meilleure qualité disponibles sur le système.
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que l'API de synthèse vocale est disponible
    if (!window.speechSynthesis) {
        console.error("L'API de synthèse vocale n'est pas disponible dans ce navigateur.");
        return;
    }
    
    // Fonction pour obtenir la meilleure voix française disponible
    function getBestFrenchVoice() {
        const voices = window.speechSynthesis.getVoices();
        
        // Liste des voix françaises préférées, par ordre de priorité
        const preferredVoiceNames = [
            // Voix premium Microsoft (Windows)
            'Microsoft Denise',
            'Microsoft Hortense',
            'Microsoft Claude',
            'Microsoft Julie',
            // Voix Google (Chrome)
            'Google français',
            'Google français de France',
            // Voix Apple (Safari)
            'Thomas',
            'Amélie',
            'Marie',
            // Autres voix françaises
            'Virginie'
        ];
        
        // Chercher parmi les voix préférées
        for (const voiceName of preferredVoiceNames) {
            const voice = voices.find(v => v.name.includes(voiceName));
            if (voice) {
                console.log(`Voix premium trouvée: ${voice.name}`);
                return voice;
            }
        }
        
        // Si aucune voix préférée n'est trouvée, prendre n'importe quelle voix française
        const frenchVoice = voices.find(voice => voice.lang.includes('fr'));
        if (frenchVoice) {
            console.log(`Voix française standard trouvée: ${frenchVoice.name}`);
            return frenchVoice;
        }
        
        console.warn("Aucune voix française trouvée");
        return null;
    }
    
    // Remplacer la fonction speakText originale
    window.originalSpeakText = window.speakText;
    window.speakText = function(text, button) {
        // Si déjà en train de parler, on arrête
        if (window.isSpeaking) {
            window.speechSynthesis.cancel();
            window.isSpeaking = false;
            
            // Réinitialiser tous les boutons de lecture
            document.querySelectorAll('.speak-button').forEach(btn => {
                btn.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
                btn.classList.remove('speaking');
            });
            
            return;
        }
        
        // Créer un nouvel objet d'énoncé
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Obtenir la meilleure voix française disponible
        const bestVoice = getBestFrenchVoice();
        if (bestVoice) {
            utterance.voice = bestVoice;
        }
        
        // Configurer les paramètres pour une meilleure qualité
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;     // Légèrement plus lent pour une meilleure compréhension
        utterance.pitch = 1.05;   // Légèrement plus aigu pour une voix plus claire
        utterance.volume = 1.0;   // Volume maximum
        
        // Événement de fin de lecture
        utterance.onend = function() {
            window.isSpeaking = false;
            button.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
            button.classList.remove('speaking');
        };
        
        // Événement d'erreur
        utterance.onerror = function(event) {
            console.error("Erreur de synthèse vocale:", event);
            window.isSpeaking = false;
            button.innerHTML = '<i class="fas fa-volume-up"></i> Lire';
            button.classList.remove('speaking');
        };
        
        // Changer l'apparence du bouton
        button.innerHTML = '<i class="fas fa-pause"></i> Pause';
        button.classList.add('speaking');
        
        // Lire le texte
        window.speechSynthesis.speak(utterance);
        window.isSpeaking = true;
    };
    
    // S'assurer que les voix sont chargées
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {
            console.log("Voix disponibles:", speechSynthesis.getVoices().length);
            // Précharger la meilleure voix
            getBestFrenchVoice();
        };
    }
    
    console.log("Module d'amélioration de la voix chargé avec succès");
});