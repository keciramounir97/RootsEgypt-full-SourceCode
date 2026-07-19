import { insertTreePeopleRows } from "./trees.service";

describe("insertTreePeopleRows", () => {
  it("uses knex batchInsert so tree rebuilds work on MySQL", async () => {
    const knex = {
      batchInsert: jest.fn().mockResolvedValue(undefined),
    };

    await insertTreePeopleRows(
      knex as any,
      42,
      [{ name: "Nefertari" }, { name: "" }, {}],
      500,
    );

    expect(knex.batchInsert).toHaveBeenCalledWith(
      "persons",
      [
        { tree_id: 42, name: "Nefertari" },
        { tree_id: 42, name: "Unknown" },
        { tree_id: 42, name: "Unknown" },
      ],
      500,
    );
  });
});
