import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDTO, RegisterUserDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('AuthService')
    constructor(
        private readonly JwtService: JwtService
    ){
        super()
    }
    async onModuleInit() {
        await this.$connect();
        this.logger.log('MongoDB connected')
    }
    async verifyToken(token: string){
        try {
            
            const {sub, iat, exp, ...user} = this.JwtService.verify(token,{
                secret: envs.jwtSecret
            })

            return{
                user: user,
                token: await this.signJwt(user)
            }

        } catch (error) {
            throw new RpcException({
                status: 401,
                message: `Invalid token`
            })
        }
    }
    async signJwt(payload:any){
        return this.JwtService.sign(payload)
    }

    async registerUser(registerUserDto: RegisterUserDTO) {
        const { email, name, password } = registerUserDto;
        try {
            const findUser = await this.user.findUnique({
                where: {
                    email: email,
                },
            })
            if (findUser) {
                throw new RpcException({
                    status: 400,
                    message: `User already exists`
                })
            }
            const user = await this.user.create({
                data: {
                    email,
                    name,
                    password: bcrypt.hashSync(password, 10) //Encriptar contraseña
                }
            })
            const { password: __, ...rest } = user
            return {
                user: rest,
                token: await this.signJwt(rest)
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new RpcException({
                    status: 400,
                    message: `${error.message}`
                })
            }
            throw new RpcException({ error })
        }
    }

    async loginUser(loginUserDto: LoginUserDTO) {
        const { email, password } = loginUserDto;
        try {

            const findUser = await this.user.findUnique({
                where: {
                    email: email,
                },
            })

            if(!findUser){
                throw new RpcException({
                    status: 400,
                    message: `User/Password not valid`
                })
            }

            const isPasswordValid = bcrypt.compareSync(password, findUser.password);

            if(!isPasswordValid){
                throw new RpcException({
                    status: 400,
                    message: `User/Password not valid`
                })
            }
            const { password: __, ...rest } = findUser

            return {
                user: rest,
                token: await this.signJwt(rest)
            }


        } catch (error) {
            if (error instanceof Error) {
                throw new RpcException({
                    status: 400,
                    message: `${error.message}`
                })
            }
            throw new RpcException({ error })
        }
    }


}
