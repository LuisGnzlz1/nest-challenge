import { IsBoolean, isEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  //@isEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}
