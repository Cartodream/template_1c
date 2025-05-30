/**
 * Module d'interface utilisateur pour la synthèse vocale
 * Ce script améliore l'interface utilisateur des contrôles de lecture vocale
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour créer un indicateur de volume
    function createVolumeIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'volume-indicator';
        
        // Ajouter 5 barres de volume
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'volume-bar';
            indicator.appendChild(bar);
        }
        
        return indicator;
    }
    
    // Fonction pour améliorer l'apparence des boutons de lecture existants
    function enhanceSpeakButtons() {
        document.querySelectorAll('.speak-button').forEach(button => {
            // Ajouter un indicateur de volume après chaque bouton
            const volumeIndicator = createVolumeIndicator();
            button.parentNode.insertBefore(volumeIndicator, button.nextSibling);
            
            // Remplacer l'événement de clic existant
            const originalClickHandler = button.onclick;
            button.onclick = function(event) {
                event.stopPropagation();
                
                // Activer/désactiver l'indicateur de volume
                const indicator = this.nextSibling;
                if (indicator && indicator.classList.contains('volume-indicator')) {
                    if (this.classList.contains('speaking')) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                }
                
                // Appeler le gestionnaire d'origine
                if (originalClickHandler) {
                    originalClickHandler.call(this, event);
                }
            };
        });
    }
    
    // Remplacer la fonction addSpeakButton pour utiliser notre version améliorée
    if (window.addSpeakButton) {
        const originalAddSpeakButton = window.addSpeakButton;
        
        window.addSpeakButton = function(element) {
            // Appeler la fonction originale
            originalAddSpeakButton(element);
            
            // Améliorer le bouton qui vient d'être ajouté
            const button = element.querySelector('.speak-button');
            if (button) {
                const volumeIndicator = createVolumeIndicator();
                button.parentNode.insertBefore(volumeIndicator, button.nextSibling);
                
                // Ajouter un gestionnaire d'événements pour l'indicateur de volume
                const originalClickHandler = button.onclick;
                button.onclick = function(event) {
                    event.stopPropagation();
                    
                    // Activer/désactiver l'indicateur de volume
                    const indicator = this.nextSibling;
                    if (indicator && indicator.classList.contains('volume-indicator')) {
                        if (!this.classList.contains('speaking')) {
                            indicator.classList.add('active');
                        } else {
                            indicator.classList.remove('active');
                        }
                    }
                    
                    // Appeler le gestionnaire d'origine
                    if (originalClickHandler) {
                        originalClickHandler.call(this, event);
                    }
                };
            }
        };
    }
    
    // Observer les mutations du DOM pour améliorer les boutons ajoutés dynamiquement
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Vérifier si le nœud ajouté contient un bouton de lecture
                        const buttons = node.querySelectorAll('.speak-button');
                        if (buttons.length > 0) {
                            enhanceSpeakButtons();
                        }
                    }
                }
            }
        });
    });
    
    // Observer les changements dans le corps du document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log("Module d'interface utilisateur vocale chargé avec succès");
});