import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { companyController } from './company.controller';
import { AuthenticatedRequest } from '../../shared/types';

export const companyRouter = Router();

companyRouter.use(authMiddleware);

const wrap =
  (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res, next);

companyRouter.get('/', wrap(companyController.list));
companyRouter.post('/', wrap(companyController.create));
companyRouter.get('/:id', wrap(companyController.getById));
companyRouter.put('/:id', wrap(companyController.update));
