import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthMicroservie')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    }
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }))

  await app.listen()
  logger.log('Auth-ms is running successfully')
}
bootstrap();
