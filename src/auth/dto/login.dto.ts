import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'usuario123', description: 'Nombre de usuario único' })
    @IsString()
    user: string;

    @IsString()
    @ApiProperty({ example: 'password1234', description: 'Contraseña del usuario' })
    password: string;
}