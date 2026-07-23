import { Injectable, Inject, Logger } from '@nestjs/common';
import { Knex } from "knex";
import { Book } from '../../models/Book';
import { Tree } from '../../models/Tree';
import { Person } from '../../models/Person';
import { User } from '../../models/User';
import { Audio } from '../../models/Audio';
import { Document } from '../../models/Document';
import { Gallery } from '../../models/Gallery';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(@Inject("KnexConnection") private readonly knex: Knex) {}

  async search(query: string, user?: User) {
    if (!query) return { books: [], trees: [], people: [], audios: [], documents: [], gallery: [] };
    const q = query.trim();

    const roleId = Number(
      (user as any)?.role_id ??
        (user as any)?.roleId ??
        (user as any)?.role ??
        0,
    );
    const canSeeAllTrees =
      user &&
      (roleId === 1 ||
        roleId === 3 ||
        (user as any).roleName === "admin" ||
        (user as any).roleName === "super_admin");

    try {
      // Books
      const books = await Book.query(this.knex)
        .where("is_public", true)
        .andWhere((builder) => {
          builder
            .where("title", "like", `${q}%`)
            .orWhere("author", "like", `${q}%`)
            .orWhere("category", "like", `${q}%`)
            .orWhere("description", "like", `%${q}%`);
        })
        .orderBy("title", "asc")
        .limit(20);

      // Trees
      const treeQuery = Tree.query(this.knex).where((builder) => {
        builder
          .where("title", "like", `${q}%`)
          .orWhere("title", "like", `%${q}%`)
          .orWhere("description", "like", `${q}%`)
          .orWhere("description", "like", `%${q}%`);
      });

      if (!canSeeAllTrees) {
        if (user) {
          treeQuery.andWhere((builder) => {
            builder.where("is_public", true).orWhere("user_id", user.id);
          });
        } else {
          treeQuery.where("is_public", true);
        }
      }

      const trees = await treeQuery
        .orderBy("title", "asc")
        .limit(20)
        .withGraphFetched("owner")
        .modifyGraph("owner", (builder: any) =>
          builder.select("id", "full_name"),
        );

      // People
      const peopleQuery = Person.query(this.knex)
        .joinRelated("tree")
        .where("name", "like", `%${q}%`);

      if (!canSeeAllTrees) {
        if (user) {
          peopleQuery.where((builder) => {
            builder
              .where("tree.is_public", true)
              .orWhere("tree.user_id", user.id);
          });
        } else {
          peopleQuery.where("tree.is_public", true);
        }
      }

      const people = await peopleQuery
        .orderBy("name", "asc")
        .limit(30)
        .withGraphFetched("tree.owner")
        .modifyGraph("tree.owner", (builder: any) =>
          builder.select("id", "full_name"),
        );

      const publicOnly = (builder: any) => {
        if (!canSeeAllTrees) builder.where("is_public", true);
      };
      const audios = await Audio.query(this.knex)
        .where((builder) => builder.where("title", "like", `%${q}%`).orWhere("description", "like", `%${q}%`).orWhere("category", "like", `%${q}%`).orWhere("archive_source", "like", `%${q}%`))
        .modify(publicOnly).orderBy("title", "asc").limit(20);
      const documents = await Document.query(this.knex)
        .where((builder) => builder.where("title", "like", `%${q}%`).orWhere("description", "like", `%${q}%`).orWhere("category", "like", `%${q}%`).orWhere("archive_source", "like", `%${q}%`).orWhere("document_code", "like", `%${q}%`))
        .modify(publicOnly).orderBy("title", "asc").limit(20);
      const gallery = await Gallery.query(this.knex)
        .where((builder) => builder.where("title", "like", `%${q}%`).orWhere("description", "like", `%${q}%`).orWhere("archive_source", "like", `%${q}%`).orWhere("document_code", "like", `%${q}%`).orWhere("location", "like", `%${q}%`).orWhere("photographer", "like", `%${q}%`))
        .modify(publicOnly).orderBy("title", "asc").limit(20);

      return {
        books,
        trees: trees.map((t: any) => ({
          ...t,
          owner_name: t.owner?.full_name,
        })),
        people: people.map((p: any) => ({
          id: p.id,
          name: p.name,
          tree_id: p.tree?.id,
          tree_title: p.tree?.title,
          tree_description: p.tree?.description,
          tree_is_public: !!p.tree?.is_public,
          owner_name: p.tree?.owner?.full_name,
        })),
        audios,
        documents,
        gallery,
      };
    } catch (error: any) {
      this.logger.warn(
        `Search unavailable, returning empty result set: ${error?.message || error}`,
      );
      return { books: [], trees: [], people: [], audios: [], documents: [], gallery: [] };
    }
  }
}
