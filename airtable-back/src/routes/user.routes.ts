import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { airtableService } from './../lib/airtable.service'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from '../types/auth';
import { AirtableUser } from '../types/airtable.types';

const router = express.Router();

// Inscription
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await airtableService.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await airtableService.createUser({
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
});

// Connexion
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await airtableService.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
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
});

// Get user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const user = await airtableService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
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
    
    const user = await airtableService.updateUser(req.user.id, {
      username,
      allergies,
    });

    console.log('User updated successfully:', user.id);

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Change password
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await airtableService.getUserById(req.user.id);
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
    await airtableService.updateUser(req.user.id, {
      password: hashedPassword
    });

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Get all users (admin only)
router.get('/', authenticate, authorize(['admin']), async (req: Request, res: Response) => {
  try {
    const users = await airtableService.getAllUsers();
    
    const usersWithoutPassword = users.map((user: AirtableUser) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

export default router; 