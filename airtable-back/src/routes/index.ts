import express from 'express';
import recipeRoutes from './recipe.routes';
import ingredientRoutes from './ingredient.routes';
import userRoutes from './user.routes';

const router = express.Router();

// Routes pour les recettes
router.use('/recipes', recipeRoutes);

// Routes pour les ingrédients
router.use('/ingredients', ingredientRoutes);

// Routes pour les utilisateurs
router.use('/users', userRoutes);

export default router;   