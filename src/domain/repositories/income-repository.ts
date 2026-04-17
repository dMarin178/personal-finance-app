import { Income } from '@domain/entities/income';

export interface IncomeRepository {
  create(income: Income): Promise<void>;
  findById(id: string): Promise<Income | null>;
  findByUserId(userId: string): Promise<Income[]>;
  update(income: Income): Promise<void>;
  delete(id: string): Promise<void>;
}
