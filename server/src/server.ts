// server.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose, { Error } from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth';
import particularRoutes from './routes/particulars';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app:Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gold_pawn_broker')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/particulars', authenticateToken, particularRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// // Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use('*path', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

export default app;