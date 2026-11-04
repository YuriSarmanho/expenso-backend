import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: any) {
    const { email, name, username, password, role, balance } = body;

    const userWithSameEmail = await this.prisma.db.orm.public.User.where({
      email,
    }).first();

    const userWithSameUsername = await this.prisma.db.orm.public.User.where({
      username,
    }).first();

    if (userWithSameEmail) {
      throw new ConflictException('Email já cadastrado');
    }
    if (userWithSameUsername) {
      throw new ConflictException(`Username ${username} já está em uso`);
    }

    await this.prisma.db.orm.public.User.create({
      email,
      name,
      username,
      password,
      role,
      balance,
    });
  }

  @Get()
  async getUser() {
    const users = await this.prisma.db.orm.public.User.all();

    return users;
  }
}
