import express from 'express';
import { IngredientController } from '../controllers';

const router = express.Router();

// Obtenir tous les ingrédients ou rechercher
router.get(
  '/',
  IngredientController.getAllIngredients
);

export default router; 