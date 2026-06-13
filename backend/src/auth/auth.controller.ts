import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        if (!body.username || !body.password) throw new UnauthorizedException();
        return this.authService.login(body.username, body.password);
    }
}
