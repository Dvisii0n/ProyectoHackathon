import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import rutas from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

const origenes = env.corsOrigin === '*'
  ? '*'
  : env.corsOrigin.split(',').map((origen) => origen.trim());

app.use(cors({ origin: origenes }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', rutas);

app.use(notFound);
app.use(errorHandler);

export default app;
