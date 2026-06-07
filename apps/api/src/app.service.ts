import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<{ status: string; database: string }> {
    const dbOk = await this.prisma.isHealthy();
    if (!dbOk) {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok', database: 'ok' };
  }
}
