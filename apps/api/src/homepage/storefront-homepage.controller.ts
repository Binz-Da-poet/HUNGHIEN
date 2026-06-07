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

/**
 * Public endpoint to expose bank transfer settings for checkout/success page.
 */
@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  getStoreSettings() {
    return this.homepageService.getPublicStoreSettings();
  }
}
