import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { AdminSessionGuard } from '../auth/admin-session.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImageStorageService } from '../catalog/image-storage.service';
import { CreateBannerDto, UpdateBannerDto, CreateSectionDto, UpdateSectionDto, ReorderDto, StoreSettingsDto } from './dto/homepage.dto';

@Controller('admin/homepage')
@UseGuards(AdminSessionGuard)
export class AdminHomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  // Banners
  @Get('banners')
  findAllBanners() { return this.homepageService.findAllBanners(); }

  @Post('banners')
  createBanner(@Body() dto: CreateBannerDto) { return this.homepageService.createBanner(dto); }

  @Patch('banners/:id')
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) { return this.homepageService.updateBanner(id, dto); }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) { return this.homepageService.deleteBanner(id); }

  // Sections
  @Get('sections')
  findAllSections() { return this.homepageService.findAllSections(); }

  @Post('sections')
  createSection(@Body() dto: CreateSectionDto) { return this.homepageService.createSection(dto); }

  @Patch('sections/:id')
  updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) { return this.homepageService.updateSection(id, dto); }

  @Delete('sections/:id')
  deleteSection(@Param('id') id: string) { return this.homepageService.deleteSection(id); }

  @Post('sections/reorder')
  reorderSections(@Body() dto: ReorderDto) { return this.homepageService.reorderSections(dto.ids); }

  // Settings
  @Get('settings')
  getSettings() { return this.homepageService.getSettings(); }

  @Patch('settings')
  updateSettings(@Body() dto: StoreSettingsDto) { return this.homepageService.updateSettings(dto); }

  // Categories, Groups, Brands, Benefits
  @Get('featured-categories')
  findAllFeaturedCategories() { return this.homepageService.findAllFeaturedCategories(); }
  @Post('featured-categories')
  createFeaturedCategory(@Body() data: any) { return this.homepageService.createFeaturedCategory(data); }
  @Patch('featured-categories/:id')
  updateFeaturedCategory(@Param('id') id: string, @Body() data: any) { return this.homepageService.updateFeaturedCategory(id, data); }
  @Delete('featured-categories/:id')
  deleteFeaturedCategory(@Param('id') id: string) { return this.homepageService.deleteFeaturedCategory(id); }

  @Get('product-groups')
  findAllProductGroups() { return this.homepageService.findAllProductGroups(); }
  @Post('product-groups')
  createProductGroup(@Body() dto: any) { return this.homepageService.createProductGroup(dto); }
  @Patch('product-groups/:id')
  updateProductGroup(@Param('id') id: string, @Body() dto: any) { return this.homepageService.updateProductGroup(id, dto); }
  @Delete('product-groups/:id')
  deleteProductGroup(@Param('id') id: string) { return this.homepageService.deleteProductGroup(id); }

  @Get('brands')
  findAllFeaturedBrands() { return this.homepageService.findAllFeaturedBrands(); }
  @Post('brands')
  createFeaturedBrand(@Body() data: any) { return this.homepageService.createFeaturedBrand(data); }
  @Patch('brands/:id')
  updateFeaturedBrand(@Param('id') id: string, @Body() data: any) { return this.homepageService.updateFeaturedBrand(id, data); }
  @Delete('brands/:id')
  deleteFeaturedBrand(@Param('id') id: string) { return this.homepageService.deleteFeaturedBrand(id); }

  @Get('benefits')
  findAllBenefits() { return this.homepageService.findAllBenefits(); }
  @Post('benefits')
  createBenefit(@Body() data: any) { return this.homepageService.createBenefit(data); }
  @Patch('benefits/:id')
  updateBenefit(@Param('id') id: string, @Body() data: any) { return this.homepageService.updateBenefit(id, data); }
  @Delete('benefits/:id')
  deleteBenefit(@Param('id') id: string) { return this.homepageService.deleteBenefit(id); }

  // Image Upload
  @Post('uploads/:namespace')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(
    @Param('namespace') namespace: string,
    @UploadedFile() file: any,
  ) {
    return this.imageStorageService.saveCmsImage(namespace, file);
  }
}
