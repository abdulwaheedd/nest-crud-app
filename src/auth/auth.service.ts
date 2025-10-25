import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async register(userData: RegisterDto) {
    // const existingUser = await this.userRepo.findOne({
    //   where: { email: userData.email },
    // });
    // if (existingUser) {
    //   throw new ConflictException(`User with this email already exists`);
    // }
    const hashPassword = await this.hashPassword(userData.password);
    const newlyCreatedUser = this.userRepo.create({
      email: userData.email,
      username: userData.username,
      password: hashPassword,
      role: UserRole.USER,
    });
    const savedUser = await this.userRepo.save(newlyCreatedUser);
    const { password, ...result } = savedUser;
    return {
      user: result,
      message: 'User registered successfully',
    };
  }
  async createAdmin(userData: RegisterDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException(`User with this email already exists`);
    }
    const hashPassword = await this.hashPassword(userData.password);
    const newlyCreatedUser = this.userRepo.create({
      email: userData.email,
      username: userData.username,
      password: hashPassword,
      role: UserRole.ADMIN,
    });
    const savedUser = await this.userRepo.save(newlyCreatedUser);
    const { password, ...result } = savedUser;
    return {
      user: result,
      message: 'Admin User registered successfully',
    };
  }
  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
    });
    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        `Invalid credentials or account does not exist`,
      );
    }
    //generate and return JWT token here (implementation not shown)
    const token = this.generateJwtToken(user);
    const { password, ...result } = user || null;
    return {
      user: result,
      ...token,
      message: 'Login successful',
    };
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalide refresh token');
      }
      const accessToken = this.generateAccessToken(user);
      return { access_token: accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async getUserById(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
  private generateJwtToken(user: User) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
    };
  }
  private generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
      expiresIn: '15m',
    });
  }
  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id };
    return this.jwtService.sign(payload, {
      secret: 'refresh_secret',
      expiresIn: '10d',
    });
  }
}
