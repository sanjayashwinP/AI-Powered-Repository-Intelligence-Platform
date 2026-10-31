import { Router, Response } from 'express';
import { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { PaymentService } from '../services/payment.service';
import { CacheService } from '../services/cache.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/status', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const cacheKey = `sub:status:${userId}`;

  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  });

  const result = { active: !!subscription, plan: subscription?.planTier || 'FREE' };
  await CacheService.set(cacheKey, result, 300);
  return res.json(result);
});

router.post('/create-checkout', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const { priceId } = req.body;
  const session = await PaymentService.createCheckoutSession(
    req.user!.userId,
    priceId,
    'http://localhost:3000/success',
    'http://localhost:3000/cancel'
  );
  return res.json({ checkoutUrl: session.url });
});

export const subscriptionRouter = router;
