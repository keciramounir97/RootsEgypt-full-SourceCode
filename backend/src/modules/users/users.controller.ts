
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { Request as ExpressRequest } from "express";
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "super_admin")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateUserDto, @Request() req: ExpressRequest) {
    return this.usersService.create(body, (req as any).user.id);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @Request() req: ExpressRequest,
  ) {
    return this.usersService.update(id, body, (req as any).user.id);
  }

  @Delete(":id")
  async delete(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    return this.usersService.delete(id, (req as any).user.id);
  }
}

@Controller("admin/admins")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("super_admin")
export class AdminManagementController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAdmins() {
    return this.usersService.findAdmins();
  }

  @Post()
  async createAdmin(@Body() body: any, @Request() req: ExpressRequest) {
    return this.usersService.createAdmin(body, (req as any).user.id);
  }

  @Patch(":id")
  async updateAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req: ExpressRequest,
  ) {
    return this.usersService.updateAdmin(id, body, (req as any).user.id);
  }

  @Delete(":id")
  async deleteAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    return this.usersService.delete(id, (req as any).user.id);
  }
}
