import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async login(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) throw new UnauthorizedException();
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw new UnauthorizedException();
        const payload = { sub: user.id, username: user.username, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }
}
