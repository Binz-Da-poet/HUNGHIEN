import { IsString, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateFeaturedBrandDto {
  @IsString()
  name: string;

  @IsString()
  logoUrl: string;

  @IsString()
  @IsOptional()
  targetUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateFeaturedBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  targetUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
