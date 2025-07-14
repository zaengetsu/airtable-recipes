import express from 'express';
import { AllergyController } from '../controllers';

const router = express.Router();

// Obtenir toutes les allergies ou rechercher
router.get(
  '/',
  AllergyController.getAllAllergies
);

// Obtenir une allergie par ID
router.get(
  '/:id',
  AllergyController.getAllergyById
);

export default router; 