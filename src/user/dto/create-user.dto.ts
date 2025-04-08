import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, Matches, MaxLength, MinLength, minLength } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'usuario123', description: 'Nombre de usuario único' })
    @IsString()
    public user: string;

    @ApiProperty({ example: 'prueba@gmail.com', description: 'Email del usuario' })
    @IsString()
    @IsEmail()
    public email: string;

    @ApiProperty({ example: 'contraseñaUsuario123', description: 'Contraseña del usuario' })
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    public password: string;

    @ApiProperty({ example: 'Pepito Perez', description: 'Nombre de usuario' })
    @IsString()
    public name: string;

}
