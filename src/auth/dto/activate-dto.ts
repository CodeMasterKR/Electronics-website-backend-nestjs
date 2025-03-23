import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ActivateDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
