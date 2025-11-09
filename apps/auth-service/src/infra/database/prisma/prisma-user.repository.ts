import { Injectable } from '@nestjs/common'

import { User } from '@/auth/entities'
import { UsersRepository } from '@/auth/repositories/user'
import { CreateUserData } from '@/types/auth.types'

import { PrismaService } from './prisma.service'

@Injectable()
export class PrismaUserRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async save(user: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data: user })
  }
}
