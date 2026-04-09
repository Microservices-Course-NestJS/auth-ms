import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDTO, RegisterUserDTO } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUserDto: RegisterUserDTO){
    return this.authService.registerUser(registerUserDto);
  }
  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDTO){
    return this.authService.loginUser(loginUserDto);
  }
  @MessagePattern('auth.verify.token')
  verifyUser(@Payload() token: string){
    return this.authService.verifyToken(token)
  }
}
