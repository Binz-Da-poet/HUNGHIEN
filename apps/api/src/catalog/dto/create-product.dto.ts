import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsInt()
  @Min(1)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  originalPrice?: number;

  @IsString()
  brand: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
