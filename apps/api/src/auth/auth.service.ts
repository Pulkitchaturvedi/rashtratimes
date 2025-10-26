import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async setPassword(userId: string, password: string) {
    const passwordHash = await argon2.hash(password);
    await this.usersService.updatePassword(userId, { passwordHash });
  }
}
