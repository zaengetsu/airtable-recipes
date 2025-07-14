import express from 'express';
import recipeRoutes from './recipe.routes';
import ingredientRoutes from './ingredient.routes';
import userRoutes from './user.routes';
import aiRoutes from './ai.routes';
import allergyRoutes from './allergy.routes';

const router = express.Router();

// Routes pour les recettes
router.use('/recipes', recipeRoutes);

// Routes pour les ingrédients
router.use('/ingredients', ingredientRoutes);

// Routes pour les utilisateurs
router.use('/users', userRoutes);

// Routes pour l'IA
router.use('/ai', aiRoutes);

// Routes pour les allergies
router.use('/allergies', allergyRoutes);

export default router;   