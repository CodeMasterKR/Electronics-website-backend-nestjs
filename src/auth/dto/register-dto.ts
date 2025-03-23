import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  @IsPhoneNumber('UZ', { message: 'Invalid phone number' }) 
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsEnum(UserRole) 
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  regionId: string;
}
