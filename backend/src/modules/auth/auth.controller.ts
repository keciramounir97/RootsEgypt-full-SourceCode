
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  UnauthorizedException,
  Patch,
  Logger,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { VerifyResetDto } from './dto/verify-reset.dto';
import { UsersService } from '../users/users.service';
import { Request as ExpressRequest } from "express";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  private isDatabaseUnavailable(error: unknown) {
    const message =
      error instanceof Error ? error.message : String((error as any) || "");
    const code = (error as any)?.code || "";
    return (
      code === "ENOTFOUND" ||
      code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      message.includes("getaddrinfo") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ETIMEDOUT")
    );
  }

  private serviceUnavailable() {
    return new ServiceUnavailableException({
      message: "Database is temporarily unavailable",
      database: "disconnected",
    });
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) throw new UnauthorizedException("Invalid credentials");
      return await this.authService.login(user);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if (this.isDatabaseUnavailable(err)) throw this.serviceUnavailable();
      this.logger.error(
        `login error: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : "Login failed",
      );
    }
  }

  @Post("signup")
  async signup(@Body() signupDto: SignupDto) {
    try {
      return await this.authService.signup(signupDto);
    } catch (err) {
      if ((err as any)?.status) throw err;
      if (this.isDatabaseUnavailable(err)) throw this.serviceUnavailable();
      this.logger.error(
        `signup error: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : "Signup failed",
      );
    }
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken?: string }) {
    try {
      return await this.authService.refreshToken(body?.refreshToken);
    } catch (err) {
      if ((err as any)?.status) throw err;
      if (this.isDatabaseUnavailable(err)) throw this.serviceUnavailable();
      throw err;
    }
  }

  @Post("reset/verify")
  @HttpCode(200)
  async verifyReset(@Body() dto: VerifyResetDto) {
    return this.authService.verifyReset(dto.email, dto.code, dto.newPassword);
  }

  @Post("reset/token")
  @HttpCode(200)
  async verifyResetByToken(
    @Body() dto: { email: string; token: string; newPassword: string },
  ) {
    return this.authService.verifyResetByToken(
      dto.email,
      dto.token,
      dto.newPassword,
    );
  }

  @Post("reset")
  @HttpCode(200)
  async requestReset(@Body() dto: RequestResetDto) {
    try {
      return await this.authService.requestReset(dto.email);
    } catch (err) {
      this.logger.error(
        `requestReset error: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined,
      );
      return { message: "If the email exists, a reset link will be sent." };
    }
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Request() req: ExpressRequest) {
    return this.authService.logout(req.user.id);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: ExpressRequest) {
    return req.user;
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  async updateMe(@Body() body: any, @Request() req: ExpressRequest) {
    await this.usersService.update(req.user.id, body, req.user.id);
    return this.usersService.findOne(req.user.id);
  }
}
