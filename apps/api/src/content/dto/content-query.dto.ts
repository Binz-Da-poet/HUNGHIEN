import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentStatus } from '@prisma/client';

export class ContentQueryDto {
  @IsEnum(ContentType)
  type: ContentType;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  take?: number;
}
