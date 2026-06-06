import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsUrl, IsJSON, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BannerMode, HomepageSectionType } from '@prisma/client';

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(BannerMode)
  @IsOptional()
  mode?: BannerMode;

  @IsString()
  @IsOptional()
  desktopImageUrl?: string;

  @IsString()
  @IsOptional()
  mobileImageUrl?: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @IsOptional()
  ctaUrl?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsString()
  @IsOptional()
  backgroundImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Date)
  @IsOptional()
  startsAt?: Date;

  @Type(() => Date)
  @IsOptional()
  endsAt?: Date;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsOptional()
  productIds?: string[];
}

export class CreateBannerDto extends UpdateBannerDto {
  @IsString()
  name: string;

  @IsEnum(BannerMode)
  mode: BannerMode;
}

export class UpdateSectionDto {
  @IsEnum(HomepageSectionType)
  @IsOptional()
  type?: HomepageSectionType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  config?: any;
}

export class CreateSectionDto extends UpdateSectionDto {
  @IsEnum(HomepageSectionType)
  type: HomepageSectionType;

  @IsString()
  title: string;
}

export class ReorderDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class StoreSettingsDto {
  @IsString()
  @IsOptional()
  hotline?: string;

  @IsString()
  @IsOptional()
  storeSystemUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsOptional()
  socialLinks?: any;

  @IsString()
  @IsOptional()
  companySummary?: string;

  @IsOptional()
  supportLinks?: any;

  @IsOptional()
  policyLinks?: any;

  @IsString()
  @IsOptional()
  newsletterCopy?: string;

  @IsOptional()
  paymentMethods?: any;
}
