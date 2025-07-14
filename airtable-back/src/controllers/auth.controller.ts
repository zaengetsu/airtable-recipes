import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/auth';

export class AuthController {
  // Inscription
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role = 'user' } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await userService.createUser({
        username,
        email,
        password: hashedPassword,
        role,
        allergies: []
      });

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Connexion
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtenir le profil de l'utilisateur connecté
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour le profil de l'utilisateur connecté
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('=== MISE À JOUR PROFIL UTILISATEUR ===');
      console.log('User:', req.user);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      if (!req.user?.id) {
        console.log('No user ID found');
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const { username, allergies } = req.body;
      console.log('Updating user with data:', { username, allergies });
      
      const user = await userService.updateUser(req.user.id, {
        username,
        allergies,
      });

      console.log('User updated successfully:', user.id);

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  // Changer le mot de passe
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Vérifier l'ancien mot de passe
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe
      await userService.updateUser(req.user.id, {
        password: hashedPassword
      });

      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      next(error);
    }
  }
} 