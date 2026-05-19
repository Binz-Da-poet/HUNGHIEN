import { IsString, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsEnum(['PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'])
  status: string;
}
