import express from 'express';
import cors from 'cors';
import { authRouter } from './controllers/auth.controller';
import { subscriptionRouter } from './controllers/subscription.controller';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SaaS Platform server listening on port ${PORT}`);
});

export default app;
