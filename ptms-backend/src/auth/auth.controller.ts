import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConsentDto } from './dto/consent.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EnableMfaDto, VerifyMfaDto } from './dto/enable-mfa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('consent')
  async submitConsent(
    @Body('userId') userId: string,
    @Body() consentDto: ConsentDto,
  ) {
    return this.authService.submitConsent(userId, consentDto);
  }

  @Public()
  @Post('verify-mfa')
  async verifyMfa(
    @Body('userId') userId: string,
    @Body() verifyMfaDto: VerifyMfaDto,
  ) {
    return this.authService.verifyMfa(userId, verifyMfaDto.token);
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.logout(user.userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  async enableMfa(@CurrentUser() user: any) {
    return this.authService.enableMfa(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/confirm')
  async confirmEnableMfa(
    @CurrentUser() user: any,
    @Body() enableMfaDto: EnableMfaDto,
  ) {
    return this.authService.confirmEnableMfa(user.userId, enableMfaDto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  async disableMfa(
    @CurrentUser() user: any,
    @Body() enableMfaDto: EnableMfaDto,
  ) {
    return this.authService.disableMfa(user.userId, enableMfaDto.token);
  }
}
