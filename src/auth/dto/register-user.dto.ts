import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class RegisterUserDTO{

    @IsString()
    @IsEmail()
    email: string;


    @IsString()
    @IsStrongPassword()
    password: string;


    @IsString()
    name: string;


}