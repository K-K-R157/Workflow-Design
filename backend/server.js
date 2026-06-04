import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';

// Config & Services
import connectDB from './config/db.js';
import socketManager from './services/SocketManager.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import runRoutes from './routes/runRoutes.js';
import toolRoutes from './routes/toolRoutes.js';

// ─── Express App ───
const app = express();
const httpServer = createServer(app);

// ─── Middleware Chain ───
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Workflow Designer API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/tools', toolRoutes);

// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Socket.IO ───
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize SocketManager singleton
socketManager.init(io);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP + WebSocket server
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('┌─────────────────────────────────────────────┐');
      console.log('│     🚀 Workflow Designer API                │');
      console.log('├─────────────────────────────────────────────┤');
      console.log(`│  HTTP    → http://localhost:${PORT}            │`);
      console.log(`│  WS      → ws://localhost:${PORT}              │`);
      console.log(`│  Env     → ${process.env.NODE_ENV || 'development'}                   │`);
      console.log('│  Health  → /api/health                      │');
      console.log('│  Tools   → /api/tools                       │');
      console.log('└─────────────────────────────────────────────┘');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

export default app;
