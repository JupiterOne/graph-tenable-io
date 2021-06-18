import {
  IntegrationConfigLoadError,
  IntegrationValidationError,
} from "@jupiterone/integration-sdk-core";
import invocationValidator from "./invocationValidator";

it("should reject", async () => {
  const executionContext = {
    instance: {
      config: {},
    },
  };
  try {
    await invocationValidator(executionContext as any);
  } catch (e) {
    expect(e).toBeInstanceOf(IntegrationConfigLoadError);
  }
});

it("auth error", async () => {
  const executionContext = {
    instance: {
      config: {
        accessKey: "XXX",
        secretKey: "YYY",
      },
    },
  };
  try {
    await invocationValidator(executionContext as any);
  } catch (e) {
    expect(e).toBeInstanceOf(IntegrationValidationError);
  }
});
