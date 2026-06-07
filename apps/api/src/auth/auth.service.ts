import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.adminSession.create({
      data: {
        tokenHash,
        expiresAt,
        adminId: admin.id,
      },
    });

    return { rawToken, admin: { id: admin.id, email: admin.email, name: admin.name } };
  }

  async validateSession(rawToken: string) {
    if (!rawToken) return null;
    
    const tokenHash = this.hashToken(rawToken);
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });

    if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
      return null;
    }

    return session.admin;
  }

  async logout(rawToken: string) {
    if (!rawToken) return;
    
    const tokenHash = this.hashToken(rawToken);
    try {
      await this.prisma.adminSession.delete({ where: { tokenHash } });
    } catch {
      // Ignore if session already deleted or not found
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
