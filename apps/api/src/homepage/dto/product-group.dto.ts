import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductGroupItemDto {
  @IsString()
  productId: string;
}

export class CreateProductGroupDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  accent?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductGroupItemDto)
  @ArrayUnique((item: ProductGroupItemDto) => item.productId, {
    message: 'productIds không được trùng lặp.',
  })
  items?: ProductGroupItemDto[];
}

export class UpdateProductGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  accent?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductGroupItemDto)
  @ArrayUnique((item: ProductGroupItemDto) => item.productId, {
    message: 'productIds không được trùng lặp.',
  })
  items?: ProductGroupItemDto[];
}
