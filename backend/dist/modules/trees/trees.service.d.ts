import { Knex } from "knex";
import { Tree } from '../../models/Tree';
import { ActivityService } from '../activity/activity.service';
export declare class TreesService {
    private readonly knex;
    private readonly activityService;
    constructor(knex: Knex, activityService: ActivityService);
    listPublic(): Promise<Tree[]>;
    getPublic(id: number): Promise<Tree>;
    listByUser(userId: number): Promise<Tree[]>;
    listAdmin(): Promise<Tree[]>;
    findOne(id: number): Promise<Tree>;
    create(data: any, userId: number, file?: Express.Multer.File): Promise<Tree>;
    update(id: number, data: any, userId: number, userRole: number, file?: Express.Multer.File): Promise<{
        id: number;
    }>;
    delete(id: number, userId: number, userRole: number): Promise<{
        message: string;
    }>;
    getGedcomPath(tree: Tree): string;
    private inferDataFormat;
    private normalizeGedcomName;
    private parseGedcomPeople;
    rebuildPeople(treeId: number, gedcomPath: string): Promise<void>;
}
