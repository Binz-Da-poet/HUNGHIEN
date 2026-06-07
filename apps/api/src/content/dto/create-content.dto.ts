import { IsString, IsEnum, IsOptional, IsInt, Min, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentStatus } from '@prisma/client';

export class CreateContentDto {
  @IsEnum(ContentType)
  type: ContentType;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  excerpt: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @ValidateNested()
  @Type(() => Object)
  content: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
