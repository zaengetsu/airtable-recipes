export const NUTRITION_ANALYSIS_PROMPT = (recipeName: string, ingredients: string) => `Analysez les valeurs nutritionnelles de cette recette et fournissez une analyse détaillée au format markdown :

**Recette :** ${recipeName}
**Ingrédients :** ${ingredients}

Fournissez une analyse complète et détaillée avec :

## 📊 **Valeurs nutritionnelles estimées**
- Calories totales
- Protéines (g)
- Glucides (g)
- Lipides (g)
- Fibres (g)

## 🥬 **Vitamines et minéraux présents**
- Liste des vitamines principales
- Minéraux importants

## ⚠️ **Allergènes potentiels**
- Identification des allergènes courants

## 💡 **Conseils nutritionnels**
- Points positifs de la recette
- Suggestions d'amélioration
- Pour qui cette recette convient

Format de réponse en markdown avec emojis, titres en gras, et mise en forme claire et professionnelle.`;

export const NUTRITION_JSON_ANALYSIS_PROMPT = (ingredients: string) => `Analysez les valeurs nutritionnelles suivantes et fournissez une analyse détaillée au format JSON:
${ingredients}

Répondez uniquement avec un objet JSON contenant:
{
  "totalCalories": number,
  "totalProteins": number,
  "totalCarbs": number,
  "totalFats": number,
  "vitamins": string[],
  "minerals": string[],
  "allergens": string[]
}`;

export const NUTRITION_SYSTEM_PROMPT = 'Vous êtes un expert en nutrition qui analyse les ingrédients et fournit des informations nutritionnelles précises et détaillées.';

export const NUTRITION_JSON_SYSTEM_PROMPT = 'Vous êtes un expert en nutrition qui analyse les ingrédients et fournit des informations nutritionnelles précises.'; 