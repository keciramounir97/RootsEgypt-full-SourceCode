import { NotificationsController } from "./notifications.controller";
import { PATH_METADATA } from "@nestjs/common/constants";

describe("NotificationsController", () => {
  it("mounts under the global /api prefix without duplicating it", () => {
    expect(Reflect.getMetadata(PATH_METADATA, NotificationsController)).toBe(
      "notifications",
    );
  });

  it("returns a bounded notification list for frontend polling", async () => {
    const service = {
      list: jest.fn().mockResolvedValue([
        {
          id: "activity-1",
          title: "Tree updated",
          body: "A GEDCOM tree was rebuilt.",
          createdAt: 1716211200000,
          read: false,
          type: "trees",
        },
      ]),
    };
    const controller = new NotificationsController(service as any);

    await expect(controller.list("50")).resolves.toEqual({
      items: [
        {
          id: "activity-1",
          title: "Tree updated",
          body: "A GEDCOM tree was rebuilt.",
          createdAt: 1716211200000,
          read: false,
          type: "trees",
        },
      ],
    });
    expect(service.list).toHaveBeenCalledWith(50);
  });
});
