import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret',
    });
  }
  async validate(payload: any) {
    try {
      const user = await this.authService.getUserById(payload.sub);
      return { ...user, role: payload.role };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
