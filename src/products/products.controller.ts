import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('Productos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  @ApiOperation({ summary: 'Crea un producto y lo asocia con el usuario logeado' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @Post()
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user);
  }

  @ApiOperation({ summary: 'Lista de productos' })
  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.productsService.findAll(page, limit);
  }

  @ApiOperation({ summary: 'Busquedad de un producto por idProduct' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualiza un producto por su idProduct' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @ApiOperation({ summary: 'Elimina un producto' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user);
  }
}
