import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../shared/types';
import { companyService } from './company.service';

const companySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  market: z.string().optional(),
  targetAudience: z.string().optional(),
  valueProposition: z.string().optional(),
  problemsSolved: z.string().optional(),
  solutions: z.string().optional(),
  benefits: z.string().optional(),
  icp: z.string().optional(),
  persona: z.string().optional(),
});

const updateSchema = companySchema.partial();

export const companyController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = companySchema.parse(req.body);
      const company = await companyService.create(req.user.id, data);
      res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const company = await companyService.getById(String(req.params.id), req.user.id);
      res.json(company);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companies = await companyService.listByUser(req.user.id);
      res.json(companies);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const company = await companyService.update(String(req.params.id), req.user.id, data);
      res.json(company);
    } catch (err) {
      next(err);
    }
  },
};
