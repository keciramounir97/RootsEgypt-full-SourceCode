import { TreesService } from './trees.service';
import { Person } from '../../models/Person';
export declare class PersonsController {
    private readonly treesService;
    private readonly knex;
    constructor(treesService: TreesService, knex: any);
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
    listMyPeople(treeId: number, req: any): Promise<Person[]>;
    getMyPerson(id: number, req: any): Promise<{
        id: number;
        name: string;
        tree: {
            id: number;
            title: string;
        };
    }>;
    createMyPerson(treeId: number, body: any, req: any): Promise<{
        id: number;
    }>;
    updateMyPerson(treeId: number, id: number, body: any, req: any): Promise<{
        id: number;
    }>;
    deleteMyPerson(treeId: number, id: number, req: any): Promise<{
        message: string;
    }>;
}
