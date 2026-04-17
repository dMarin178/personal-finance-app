import { UseCase } from './use-case';
import { User } from '@domain/entities/user';
import { UserRepository } from '@domain/repositories/user-repository';
import * as bcrypt from 'bcryptjs';

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUserOutput {
  success: boolean;
  userId?: string;
  error?: string;
}

export class RegisterUserUseCase extends UseCase<RegisterUserInput, RegisterUserOutput> {
  constructor(private userRepository: UserRepository) {
    super();
  }

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = User.create(input.email, input.name, hashedPassword);
    await this.userRepository.create(user);

    return {
      success: true,
      userId: user.id,
    };
  }
}
