import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { UserController, AuthController } from '../controllers';

const router = express.Router();

// Routes d'authentification
router.post(
  '/register',
  AuthController.register
);

router.post(
  '/login',
  AuthController.login
);

// Routes de profil utilisateur
router.get(
  '/profile',
  authenticate,
  AuthController.getProfile
);

router.put(
  '/profile',
  authenticate,
  AuthController.updateProfile
);

router.put(
  '/password',
  authenticate,
  AuthController.changePassword
);

// Routes de gestion des utilisateurs (admin seulement)
router.get(
  '/',
  authenticate,
  isAdmin,
  UserController.getAllUsers
);

export default router; 