export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public passwordHash: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(email: string, name: string, passwordHash: string): User {
    return new User(
      crypto.randomUUID(),
      email,
      name,
      passwordHash,
      new Date(),
      new Date()
    );
  }

  toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
