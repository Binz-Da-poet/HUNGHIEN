import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Controller('admin/content')
@UseGuards(AdminSessionGuard)
export class AdminContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll(@Query() query: ContentQueryDto) {
    return this.contentService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.contentService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.contentService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }
}
