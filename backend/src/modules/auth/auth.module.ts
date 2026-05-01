import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ActivityModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          process.env.JWT_SECRET ||
          "d1cb88c3dc305de2f683da0b2174fb18b18be5276b9f44d26487f2d5b34c9bb329644049d51364bf68d80a94eefe708e716277663319b8b7f51bd8590c37d31e",
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "30d",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
