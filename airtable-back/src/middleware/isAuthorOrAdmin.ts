import { Request, Response, NextFunction } from 'express';
import { tables } from '../lib/airtable';

export const isAuthorOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    const user = req.user;
    const { id } = req.params;

    // Si l'utilisateur est admin, on laisse passer
    if (user.role === 'admin') {
      return next();
    }

    // Pour les projets
    if (req.baseUrl.includes('/projects')) {
      const project = await tables.projects.find(id);
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
      }
      const students = project.get('students') as string[] || [];
      if (students.includes(user.id)) {
        return next();
      }
    }

    // Pour les commentaires
    if (req.baseUrl.includes('/comments')) {
      const comment = await tables.comments.find(id);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      if (comment.get('author') === user.id) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Accès non autorisé' });
  } catch (error) {
    console.error('Erreur dans isAuthorOrAdmin:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}; 