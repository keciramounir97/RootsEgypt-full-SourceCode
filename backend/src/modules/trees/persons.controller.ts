import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException, NotFoundException, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Person } from '../../models/Person';
import { Inject } from '@nestjs/common';

@Controller()
export class PersonsController {
    constructor(
        private readonly treesService: TreesService,
        @Inject('KnexConnection') private readonly knex
    ) { }

    private async ensureTreeAccess(treeId: number, user: any) {
        const tree = await this.treesService.findOne(treeId);
        if (!tree) throw new NotFoundException('Tree not found');

        const canManageAll = user.roleName === 'admin' || user.roleName === 'super_admin'; // Simplified role check
        // Actually use the same logic as legacy: roleId === 1 or admin
        // In JwtStrategy/AuthService we perform some mapping. user.role is roleId.

        const roleId = Number(user.role_id ?? user.roleId ?? user.role ?? 0);
        const isAdmin = roleId === 1 || roleId === 3 || user.roleName === 'admin' || user.roleName === 'super_admin';

        if (!isAdmin && tree.user_id !== user.id) {
            throw new ForbiddenException('Forbidden');
        }
        return tree;
    }

    // Public Persons
    @Get('trees/:treeId/people')
    async listPublicPeople(@Param('treeId', ParseIntPipe) treeId: number) {
        const tree = await this.treesService.getPublic(treeId);
        return Person.query(this.knex).where('tree_id', treeId).orderBy('name', 'asc');
    }

    @Get('people/:id')
    async getPublicPerson(@Param('id', ParseIntPipe) id: number) {
        const person = await Person.query(this.knex).findById(id).withGraphFetched('tree');
        if (!person || !person.tree) throw new NotFoundException('Not found');
        if (!person.tree.is_public) throw new ForbiddenException('Forbidden');

        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }

    // My Persons
    @Get('my/trees/:treeId/people')
    @UseGuards(JwtAuthGuard)
    async listMyPeople(@Param('treeId', ParseIntPipe) treeId: number, @Request() req) {
        await this.ensureTreeAccess(treeId, req.user);
        return Person.query(this.knex).where('tree_id', treeId).orderBy('name', 'asc');
    }

    @Get('my/people/:id')
    @UseGuards(JwtAuthGuard)
    async getMyPerson(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const person = await Person.query(this.knex).findById(id).withGraphFetched('tree');
        if (!person || !person.tree) throw new NotFoundException('Not found');

        await this.ensureTreeAccess(person.tree.id, req.user);

        return {
            id: person.id,
            name: person.name,
            tree: { id: person.tree.id, title: person.tree.title }
        };
    }

    @Post('my/trees/:treeId/people')
    @UseGuards(JwtAuthGuard)
    async createMyPerson(@Param('treeId', ParseIntPipe) treeId: number, @Body() body, @Request() req) {
        await this.ensureTreeAccess(treeId, req.user);

        if (!body.name) throw new BadRequestException('Name is required');

        const created = await Person.query(this.knex).insertAndFetch({
            name: body.name,
            tree_id: treeId
        });
        return { id: created.id };
    }

    @Put('my/trees/:treeId/people/:id')
    @UseGuards(JwtAuthGuard)
    async updateMyPerson(@Param('treeId', ParseIntPipe) treeId: number, @Param('id', ParseIntPipe) id: number, @Body() body, @Request() req) {
        await this.ensureTreeAccess(treeId, req.user);

        const person = await Person.query(this.knex).findById(id);
        if (!person || person.tree_id !== treeId) throw new NotFoundException('Not found');

        if (!body.name) throw new BadRequestException('Name is required');

        const updated = await Person.query(this.knex).patchAndFetchById(id, { name: body.name });
        return { id: updated.id };
    }

    @Delete('my/trees/:treeId/people/:id')
    @UseGuards(JwtAuthGuard)
    async deleteMyPerson(@Param('treeId', ParseIntPipe) treeId: number, @Param('id', ParseIntPipe) id: number, @Request() req) {
        await this.ensureTreeAccess(treeId, req.user);

        const person = await Person.query(this.knex).findById(id);
        if (!person || person.tree_id !== treeId) throw new NotFoundException('Not found');

        await Person.query(this.knex).deleteById(id);
        return { message: 'Deleted' };
    }
}
