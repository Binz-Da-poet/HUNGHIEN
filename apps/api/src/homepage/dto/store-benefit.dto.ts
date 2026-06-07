import { IsString, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  icon: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateBenefitDto {
  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
