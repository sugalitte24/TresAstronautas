import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private userService: UserService, private jwtService: JwtService) { }

    async login(loginDto: LoginDto) {
        const { user, password } = loginDto;
        const existUser = await this.userService.findByUsername(user);

        if (!existUser || !existUser.active) {
            throw new UnauthorizedException('User not found or Inactive')
        }

        const passMatch = await bcrypt.compare(password, existUser.password)

        if (!passMatch) {
            throw new UnauthorizedException('User o password incorrect')
        }

        const payload = {
            user: existUser.user,
            email: existUser.email,
            userId: existUser._id
        };

        return {
            token: this.jwtService.sign(payload, { expiresIn: '2h' }),
            user: {
                user: existUser.user,
                email: existUser.email,
                name: existUser.name,
                userId: existUser._id
            },
        }
    }
}

