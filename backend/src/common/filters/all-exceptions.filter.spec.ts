import { Logger, NotFoundException } from "@nestjs/common";
import { AllExceptionsFilter } from "./all-exceptions.filter";

describe("AllExceptionsFilter", () => {
  const makeHost = () => {
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const request = {
      id: "req-1",
      url: "/api/notifications?limit=50",
    };
    return {
      response,
      host: {
        switchToHttp: () => ({
          getResponse: () => response,
          getRequest: () => request,
        }),
      } as any,
    };
  };

  it("does not log missing routes as Nest errors", () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);

    const { host, response } = makeHost();
    new AllExceptionsFilter().catch(
      new NotFoundException("Cannot GET /api/notifications?limit=50"),
      host,
    );

    expect(errorSpy).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);

    errorSpy.mockRestore();
  });
});
