export const CONVERSATION_PROMPTS = {
  greeting: (message: string) => 
    `L'utilisateur a dit "${message}". 

Réponds de manière naturelle et amicale à cette salutation. Présente-toi comme un assistant culinaire et propose tes services de manière engageante. N'utilise PAS le format de recette JSON, juste une réponse conversationnelle.`,

  recipeRequest: (message: string, allergyContext: string) => 
    `Donne-moi une recette de ${message}.${allergyContext}

FORMAT DE RÉPONSE POUR UNE RECETTE :
- Utilise du markdown avec des emojis et une mise en forme attrayante
- **Le tableau des ingrédients doit être un tableau markdown standard, avec une ligne d'en-tête, une ligne de séparation avec des tirets, puis une ligne par ingrédient.**
- Ajoute des conseils culinaires et des astuces
- Inclus des variantes ou suggestions d'amélioration
- Sois créatif dans la description et les instructions
- Ajoute des notes sur les temps de repos, la conservation, etc.

Exemple de format :
## 🎯 **Nom de la recette**
*Description appétissante*

🥘 **Ingrédients :**

| Quantité | Unité | Ingrédient |
|----------|-------|------------|
| 200 | g | Farine |
| 2 | unités | Œufs |
| 150 | ml | Lait |

📝 **Instructions :**
1. Étape détaillée
...`,

  generalMessage: (message: string, allergyContext: string) => 
    `L'utilisateur a dit : "${message}". 

Réponds de manière naturelle et conversationnelle. Si c'est une demande de recette, propose une recette. Si c'est une question générale sur la cuisine, aide-le. Si c'est juste une conversation, sois amical et engageant.${allergyContext}`
}; 