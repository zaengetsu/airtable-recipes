import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import recipeRoutes from './routes/recipe.routes';
import userRoutes from './routes/user.routes';
import nutritionalAnalysisRoutes from './routes/nutritional-analysis.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nutritional-analysis', nutritionalAnalysisRoutes);
app.use('/api/ai', aiRoutes);

// Gestion des erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 