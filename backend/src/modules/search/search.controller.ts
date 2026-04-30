import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

// Optional Auth Guard
// NestJS doesn't have a built-in "Optional" guard easily without custom logic or just checking headers manually
// Or we can use a custom decorator/guard that doesn't throw.
// For simplicity, we'll try to extract user if token is present.
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // If error or no user, return null instead of throwing
        return user;
    }
}

@Controller()
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('search')
    @UseGuards(OptionalJwtAuthGuard)
    async search(@Query('q') q: string, @Request() req) {
        return this.searchService.search(q, req.user);
    }

    @Get('search/suggest')
    @UseGuards(OptionalJwtAuthGuard)
    async suggest(@Query('q') q: string, @Request() req) {
        const results = await this.searchService.search(q, req.user);
        return {
            trees: Array.isArray(results?.trees) ? results.trees.slice(0, 8) : [],
            people: Array.isArray(results?.people) ? results.people.slice(0, 8) : [],
        };
    }
}
