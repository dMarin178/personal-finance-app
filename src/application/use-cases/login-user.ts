import { UseCase } from './use-case';
import { UserRepository } from '@domain/repositories/user-repository';
import * as bcrypt from 'bcryptjs';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  success: boolean;
  userId?: string;
  email?: string;
  name?: string;
  error?: string;
}

export class LoginUserUseCase extends UseCase<LoginUserInput, LoginUserOutput> {
  constructor(private userRepository: UserRepository) {
    super();
  }

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    return {
      success: true,
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
