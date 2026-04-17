export interface CreateCreditCardDTO {
  userId: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
  lastDigits?: string;
  issuer?: string;
}

export interface CreditCardDTO {
  id: string;
  userId: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
  currentBalance: number;
  availableCredit: number;
  lastDigits?: string;
  issuer?: string;
  createdAt: Date;
}

export class CreditCard {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public creditLimit: number,
    public paymentLimit: number,
    public currentBalance: number,
    public createdAt: Date,
    public updatedAt: Date,
    public lastDigits?: string,
    public issuer?: string
  ) {}

  static create(
    userId: string,
    name: string,
    creditLimit: number,
    paymentLimit: number,
    lastDigits?: string,
    issuer?: string
  ): CreditCard {
    return new CreditCard(
      crypto.randomUUID(),
      userId,
      name,
      creditLimit,
      paymentLimit,
      0,
      new Date(),
      new Date(),
      lastDigits,
      issuer
    );
  }

  get availableCredit(): number {
    return this.creditLimit - this.currentBalance;
  }

  addExpense(amount: number): void {
    this.currentBalance += amount;
    this.updatedAt = new Date();
  }

  toDTO(): CreditCardDTO {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      creditLimit: this.creditLimit,
      paymentLimit: this.paymentLimit,
      currentBalance: this.currentBalance,
      availableCredit: this.availableCredit,
      lastDigits: this.lastDigits,
      issuer: this.issuer,
      createdAt: this.createdAt,
    };
  }
}
