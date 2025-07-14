import express from 'express';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Rechercher des allergies avec autocomplétion
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    
    if (search && typeof search === 'string') {
      // Recherche par nom d'allergie
      const allAllergies = await airtableService.getAllAllergies();
      const filteredAllergies = allAllergies.filter(allergy =>
        allergy.name.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filteredAllergies);
    } else {
      // Retourner toutes les allergies
      const allergies = await airtableService.getAllAllergies();
      res.json(allergies);
    }
  } catch (error) {
    next(error);
  }
});

// Obtenir une allergie par ID
router.get('/:id', async (req, res, next) => {
  try {
    const allergy = await airtableService.getAllergyById(req.params.id);
    if (!allergy) {
      res.status(404).json({ message: 'Allergie non trouvée' });
      return;
    }
    res.json(allergy);
  } catch (error) {
    next(error);
  }
});

export default router; 