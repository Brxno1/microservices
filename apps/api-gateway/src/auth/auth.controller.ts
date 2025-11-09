import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { AuthServiceContract } from '@/contracts/auth.service.contract'

import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dtos'
import { AuthSwaggerConfig } from './auth.swagger.config'

@Controller('/api/auth')
@AuthSwaggerConfig.controller()
export class AuthController {
  constructor(private readonly authService: AuthServiceContract) {}

  @Post('/register')
  @HttpCode(201)
  @AuthSwaggerConfig.register()
  async register(
    @Body() registerData: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse = await this.authService.register(registerData)

    if (authResponse.refreshToken) {
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      })
    }

    if (authResponse.accessToken) {
      res.cookie('accessToken', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })
    }

    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: authResponse.user,
    }
  }

  @Post('/login')
  @HttpCode(200)
  @AuthSwaggerConfig.login()
  async login(
    @Body() loginData: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse = await this.authService.login(loginData)

    if (authResponse.refreshToken) {
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      })
    }

    if (authResponse.accessToken) {
      res.cookie('accessToken', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })
    }

    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: authResponse.user,
    }
  }

  @Post('/refresh')
  @HttpCode(200)
  @AuthSwaggerConfig.refresh()
  async refresh(
    @Body() body: { refreshToken: string | undefined },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    let refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      refreshToken = body.refreshToken
    }

    if (!refreshToken) {
      throw new Error('Refresh token not found')
    }

    const authResponse = await this.authService.refreshTokens(refreshToken)

    if (authResponse.refreshToken) {
      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      })
    }

    if (authResponse.accessToken) {
      res.cookie('accessToken', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
      })
    }

    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: authResponse.user,
    }
  }

  @Post('/logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return { message: 'Logout realizado com sucesso' }
  }
}
