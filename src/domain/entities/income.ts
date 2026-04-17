export type IncomeType = 'fixed' | 'variable';

export interface CreateIncomeDTO {
  userId: string;
  description: string;
  amount: number;
  type: IncomeType;
  date?: Date;
}

export interface IncomeDTO {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: IncomeType;
  date: Date;
  createdAt: Date;
}

export class Income {
  constructor(
    public id: string,
    public userId: string,
    public description: string,
    public amount: number,
    public type: IncomeType,
    public date: Date,
    public createdAt: Date
  ) {}

  static create(
    userId: string,
    description: string,
    amount: number,
    type: IncomeType,
    date?: Date
  ): Income {
    return new Income(
      crypto.randomUUID(),
      userId,
      description,
      amount,
      type,
      date || new Date(),
      new Date()
    );
  }

  get isFixed(): boolean {
    return this.type === 'fixed';
  }

  get isVariable(): boolean {
    return this.type === 'variable';
  }

  toDTO(): IncomeDTO {
    return {
      id: this.id,
      userId: this.userId,
      description: this.description,
      amount: this.amount,
      type: this.type,
      date: this.date,
      createdAt: this.createdAt,
    };
  }
}
