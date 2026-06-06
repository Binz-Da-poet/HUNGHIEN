import { Controller, Get } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('storefront/homepage')
export class StorefrontHomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  getHomepage() {
    return this.homepageService.getPublicHomepage();
  }
}
