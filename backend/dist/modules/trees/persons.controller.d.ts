import { TreesService } from './trees.service';
import { Person } from '../../models/Person';
import { Knex } from "knex";
import { Request as ExpressRequest } from "express";
export declare class PersonsController {
    private readonly treesService;
    private readonly knex;
    constructor(treesService: TreesService, knex: Knex);
    private ensureTreeAccess;
    listPublicPeople(treeId: number): Promise<Person[]>;
    getPublicPerson(id: number): Promise<{
        id: number;
        name: string;
        tree: {
            id: number;
            title: string;
        };
    }>;
    listMyPeople(treeId: number, req: ExpressRequest): Promise<Person[]>;
    getMyPerson(id: number, req: ExpressRequest): Promise<{
        id: number;
        name: string;
        tree: {
            id: number;
            title: string;
        };
    }>;
    createMyPerson(treeId: number, body: any, req: ExpressRequest): Promise<{
        id: number;
    }>;
    updateMyPerson(treeId: number, id: number, body: any, req: ExpressRequest): Promise<{
        id: number;
    }>;
    deleteMyPerson(treeId: number, id: number, req: ExpressRequest): Promise<{
        message: string;
    }>;
}
