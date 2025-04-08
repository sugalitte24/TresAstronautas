import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateProductDto {

    @ApiProperty({ example: 'PROD-0001', description: 'ID único del producto' })
    @IsString()
    public idProduct: string;

    @ApiProperty({ example: 'Tornillo', description: 'Nombre del producto' })
    @IsString()
    public name: string;

    @ApiProperty({ example: '9000', description: 'Valor del Producto' })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    public price: number;

}
