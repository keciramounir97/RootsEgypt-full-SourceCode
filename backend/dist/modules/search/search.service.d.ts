import { Book } from '../../models/Book';
import { User } from '../../models/User';
export declare class SearchService {
    private readonly knex;
    constructor(knex: any);
    search(query: string, user?: User): Promise<{
        books: Book[];
        trees: any[];
        people: {
            id: any;
            name: any;
            tree_id: any;
            tree_title: any;
            tree_description: any;
            tree_is_public: boolean;
            owner_name: any;
        }[];
    }>;
}
