import { IsString } from 'class-validator';

export class TrackOrderDto {
  @IsString()
  publicCode: string;

  @IsString()
  phone: string;
}
