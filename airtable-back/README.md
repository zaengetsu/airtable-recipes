# Airtable Backend

## Description
Backend de l'application de gestion de projets ESGI, développé avec Node.js, Express et TypeScript. Cette API permet de gérer les projets, les utilisateurs et les commentaires, avec une authentification JWT.

## Liens du projet
- Backend (ce repository) : https://github.com/zaengetsu/airtable-back
- Frontend : https://github.com/zaengetsu/airtable-front

## Fonctionnalités
- Authentification JWT
- Gestion des projets (CRUD)
- Système de rôles (admin/user)
- Intégration avec Airtable

## Technologies utilisées
- Node.js
- Express
- TypeScript
- JWT pour l'authentification
- Airtable comme base de données
- bcrypt pour le hachage des mots de passe
- cors pour la gestion des CORS

## Configuration

Assurez-vous d'avoir un fichier `.env.local` avec les variables suivantes :
- `AIRTABLE_API_KEY` : Votre clé API Airtable
- `AIRTABLE_BASE_ID` : L'ID de votre base Airtable

## Initialisation Airtable

Le projet utilise une initialisation centralisée d'Airtable pour éviter la duplication de code. Voici comment l'utiliser :

### Import de l'initialisation

```typescript
import { tables, testConnection } from '../lib/airtable';
```

### Utilisation directe des tables

```typescript
// Accès direct aux tables
const recipes = await tables.recipes.select().all();
const users = await tables.users.find('user_id');
const ingredients = await tables.ingredients.create({ name: 'Tomato' });
```

### Utilisation des services spécifiques

```typescript
// Import des services spécifiques
import { recipeService } from '../services/recipe.service';
import { userService } from '../services/user.service';
import { ingredientService } from '../services/ingredient.service';
import { allergyService } from '../services/allergy.service';
import { nutritionalAnalysisService } from '../services/nutritionalAnalysis.service';

// Utilisation
const recipe = await recipeService.getRecipeById('recipe_id');
const user = await userService.getUserByEmail('user@example.com');
const ingredients = await ingredientService.getAllIngredients();
```

### Test de connexion

```typescript
// Tester la connexion à Airtable
const isConnected = await testConnection();
if (isConnected) {
  console.log('✅ Connexion réussie');
} else {
  console.log('❌ Erreur de connexion');
}
```

## Tables disponibles

- `tables.recipes` - Table des recettes
- `tables.users` - Table des utilisateurs
- `tables.ingredients` - Table des ingrédients
- `tables.allergies` - Table des allergies
- `tables.nutritionalAnalysis` - Table des analyses nutritionnelles
- `tables.projects` - Table des projets
- `tables.comments` - Table des commentaires

## Services disponibles

- `recipeService` - Gestion des recettes
- `userService` - Gestion des utilisateurs
- `ingredientService` - Gestion des ingrédients
- `allergyService` - Gestion des allergies
- `nutritionalAnalysisService` - Gestion des analyses nutritionnelles

## Avantages de cette approche

1. **Initialisation unique** : Une seule instance d'Airtable est créée
2. **Gestion centralisée des erreurs** : Configuration et vérification au démarrage
3. **Services spécialisés** : Chaque service gère sa propre logique métier
4. **Maintenance simplifiée** : Un seul endroit pour modifier la configuration
5. **Performance** : Évite la création multiple de connexions

## Installation

1. Cloner le repository :
```
```