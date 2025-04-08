import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
    let service: AuthService;
    let mockUserService: any;
    let mockJwtService: any;

    beforeEach(async () => {
        mockUserService = {
            findByUsername: jest.fn(),
        };
        mockJwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserService, useValue: mockUserService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        const loginDto: LoginDto = { user: 'u', password: 'p' };

        it('debería lanzar UnauthorizedException si el usuario no existe o está inactivo', async () => {
            mockUserService.findByUsername.mockResolvedValue(null);
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);

            mockUserService.findByUsername.mockResolvedValue({ active: false } as any);
            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('debería lanzar UnauthorizedException si la contraseña no coincide', async () => {
            const existUser = { active: true, password: 'hashedPwd' };
            mockUserService.findByUsername.mockResolvedValue(existUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(bcrypt.compare).toHaveBeenCalledWith('p', 'hashedPwd');
        });

        it('debería devolver token y datos de usuario cuando las credenciales son válidas', async () => {
            const existUser = {
                active: true,
                password: 'hashedPwd',
                user: 'u',
                email: 'e@mail.com',
                name: 'Nombre',
                _id: 'userId123',
            } as any;

            mockUserService.findByUsername.mockResolvedValue(existUser);
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
            mockJwtService.sign.mockReturnValue('signedToken');

            const result = await service.login(loginDto);

            expect(bcrypt.compare).toHaveBeenCalledWith('p', 'hashedPwd');
            expect(mockJwtService.sign).toHaveBeenCalledWith(
                { user: 'u', email: 'e@mail.com', userId: 'userId123' },
                { expiresIn: '2h' },
            );
            expect(result).toEqual({
                token: 'signedToken',
                user: {
                    user: 'u',
                    email: 'e@mail.com',
                    name: 'Nombre',
                    userId: 'userId123',
                },
            });
        });
    });
});
