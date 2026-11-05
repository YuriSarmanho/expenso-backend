import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hash } from 'argon2';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js';

const createAccountBodySchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.email(),
  password: z.string(),
  role: z.enum(['admin', 'costumer']),
  balance: z.float64(),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
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
