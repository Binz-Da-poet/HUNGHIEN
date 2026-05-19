import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
