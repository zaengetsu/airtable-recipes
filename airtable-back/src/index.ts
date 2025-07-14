import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', routes);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Route 404
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    message: `L'endpoint ${req.method} ${req.path} n'existe pas`
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
