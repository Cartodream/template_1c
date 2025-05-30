/**
 * Script pour désactiver la lecture vocale automatique lors de la sélection de texte
 */

document.addEventListener('DOMContentLoaded', function() {
    // Désactiver la lecture vocale automatique lors de la sélection de texte
    document.addEventListener('selectionchange', function(e) {
        // Empêcher le déclenchement automatique de la lecture vocale
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);
    
    // Désactiver également les événements de sélection de texte qui pourraient déclencher la lecture vocale
    document.addEventListener('mouseup', function(e) {
        // Vérifier si un texte est sélectionné
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            // Ne pas déclencher la lecture vocale automatique
            e.stopPropagation();
        }
    }, true);
    
    console.log("Désactivation de la lecture vocale automatique lors de la sélection de texte");
});