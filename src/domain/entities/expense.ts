export interface CreateExpenseDTO {
  userId: string;
  creditCardId?: string;
  description: string;
  amount: number;
  category: string;
  date?: Date;
}

export interface ExpenseDTO {
  id: string;
  userId: string;
  creditCardId?: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
}

export class Expense {
  constructor(
    public id: string,
    public userId: string,
    public creditCardId: string | undefined,
    public description: string,
    public amount: number,
    public category: string,
    public date: Date,
    public createdAt: Date
  ) {}

  static create(
    userId: string,
    description: string,
    amount: number,
    category: string,
    creditCardId?: string,
    date?: Date
  ): Expense {
    return new Expense(
      crypto.randomUUID(),
      userId,
      creditCardId,
      description,
      amount,
      category,
      date || new Date(),
      new Date()
    );
  }

  toDTO(): ExpenseDTO {
    return {
      id: this.id,
      userId: this.userId,
      creditCardId: this.creditCardId,
      description: this.description,
      amount: this.amount,
      category: this.category,
      date: this.date,
      createdAt: this.createdAt,
    };
  }
}
