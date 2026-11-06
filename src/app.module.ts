import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { CreateAccountController } from './controllers/create-account.controller.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CreateAccountController],
  providers: [PrismaService],
})
export class AppModule {}
