import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDTO, RegisterUserDTO } from './dto';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('AuthService')

    async onModuleInit() {
        await this.$connect();
        this.logger.log('MongoDB connected')
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
                rest
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
                token: 'ABC'
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
