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
      useFactory: async (configService: ConfigService) => {
        const secret =
          configService.get<string>("JWT_SECRET") || process.env.JWT_SECRET;
        if (!secret) {
          throw new Error(
            "JWT_SECRET environment variable is required. Set it in EasyPanel or your deployment environment.",
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "1d",
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
