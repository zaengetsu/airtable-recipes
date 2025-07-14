import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { AuthenticatedRequest } from '../types/auth';

export class UserController {
  // Obtenir tous les utilisateurs (admin seulement)
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  // Obtenir un utilisateur par son ID
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Vérifier si l'utilisateur modifie son propre profil ou s'il est admin
      if (req.params.id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à modifier cet utilisateur' });
      }

      const updatedUser = await userService.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }



  // Obtenir le profil de l'utilisateur connecté
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Profil non trouvé' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour le profil de l'utilisateur connecté
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updatedUser = await userService.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
} 