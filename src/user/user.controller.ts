import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('Usuarios')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Lista de usuarios' })
  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.findAll(page, limit);
  }

  @ApiOperation({ summary: 'Búsquedad de usuario por nombre de usuario' })
  @Get(':user')
  findOne(@Param('user') user: string) {
    return this.userService.findOne(user);
  }

  @ApiOperation({ summary: 'Actualiza un usuario por su nombre de usuario' })
  @Patch(':user')
  update(@Param('user') user: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user, updateUserDto);
  }

  @ApiOperation({ summary: 'Elimina un usuario' })
  @Delete(':user')
  remove(@Param('user') user: string) {
    return this.userService.remove(user);
  }
}
