import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductImageDto {
  @IsString()
  @IsOptional()
  altText?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
