import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import providerDashboardRoutes from './routes/providerDashboardRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Serve uploaded files (review images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/providers', providerDashboardRoutes);
app.use('/api/providers', skillGapRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', reviewRoutes); // mounts /api/users/:id/reviews & /api/users/:id/trust

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SilverHands server running on port ${PORT}`);
});