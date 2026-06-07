import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentType } from '@prisma/client';

@Controller('storefront/content')
export class StorefrontContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':type')
  findPublished(@Param('type') type: string) {
    const ct = this.mapType(type);
    return this.contentService.findPublishedByType(ct);
  }

  @Get(':type/:slug')
  async findPublishedBySlug(@Param('type') type: string, @Param('slug') slug: string) {
    const ct = this.mapType(type);
    return this.contentService.findPublishedBySlug(ct, slug);
  }

  private mapType(raw: string): ContentType {
    if (raw === 'news') return 'NEWS';
    if (raw === 'policy') return 'POLICY';
    throw new NotFoundException('Loại nội dung không hợp lệ.');
  }
}
