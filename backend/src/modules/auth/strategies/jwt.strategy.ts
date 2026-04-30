import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error(
            "JWT_SECRET environment variable is required. Set it in EasyPanel or your deployment environment.",
          );
        }
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
