
import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('validation')
    async findValidationUsers(@Query('status') status?: string) {
        return this.usersService.findValidationUsers(status);
    }

    @Get('pending')
    async findPendingUsers() {
        return this.usersService.findValidationUsers('pending');
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post()
    async create(@Body() body: CreateUserDto, @Request() req) {
        return this.usersService.create(body, req.user.id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto, @Request() req) {
        return this.usersService.update(id, body, req.user.id);
    }

    @Patch(':id/validate')
    async validate(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.validateUser(id, req.user.id);
    }

    @Put(':id/approve')
    @Patch(':id/approve')
    async approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.validateUser(id, req.user.id);
    }

    @Patch(':id/reject-validation')
    async rejectValidation(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.rejectValidation(id, req.user.id);
    }

    @Put(':id/reject')
    @Patch(':id/reject')
    async reject(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.rejectValidation(id, req.user.id);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.delete(id, req.user.id);
    }

}

@Controller('admin/admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminManagementController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAdmins() {
        return this.usersService.findAdmins();
    }

    @Post()
    async createAdmin(@Body() body: any, @Request() req) {
        return this.usersService.createAdmin(body, req.user.id);
    }

    @Patch(':id')
    async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req) {
        return this.usersService.updateAdmin(id, body, req.user.id);
    }

    @Delete(':id')
    async deleteAdmin(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.usersService.delete(id, req.user.id);
    }
}

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class RolesController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findRoles() {
        return this.usersService.findRoles();
    }
}

@Controller('admin/role-distribution')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class RoleDistributionController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getRoleDistribution() {
        return this.usersService.getRoleDistribution();
    }

    @Patch(':id')
    async updateRoleDistribution(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @Request() req,
    ) {
        return this.usersService.updateRoleDistribution(id, body, req.user.id);
    }
}
