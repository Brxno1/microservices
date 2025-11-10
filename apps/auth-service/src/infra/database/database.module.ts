import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { RefreshTokenBlacklist } from '@/auth/entities/refresh-token-blacklist.entity'
import { User } from '@/auth/entities/user.entity'

import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        schema: 'public',
        entities: [User, RefreshTokenBlacklist],
        synchronize: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshTokenBlacklist]),
  ],
  exports: [TypeOrmModule, PrismaModule],
})
export class DatabaseModule {}
