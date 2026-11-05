import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hash } from 'argon2';

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
      password: await hash(password, {
        type: 2,
        memoryCost: 2 ** 16, // 64 MiB
        timeCost: 3,
        parallelism: 4,
        secret: Buffer.from(process.env['DATABASE_URL']!),
      }),
      role,
      balance,
    });
  }

  @Get()
  async getUser() {
    const users = await this.prisma.db.orm.public.User.select(
      'id',
      'name',
      'username',
      'email',
      'role',
      'balance',
    ).all();

    return users;
  }
}
