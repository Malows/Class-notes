import { describe, expect, test } from "vitest";

import { SaveDeliverySchema } from "./delivery.schema";

describe("SaveDeliverySchema", () => {
  test("accepts workflow-based delivery status without boolean flags", () => {
    const result = SaveDeliverySchema.safeParse({
      assignment_id: 1,
      student_id: 1,
      workflow_status: "WAITING_FOR_CORRECTION",
      grade: 8,
      ai_level: 1,
      comments: "",
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid workflow status", () => {
    const result = SaveDeliverySchema.safeParse({
      assignment_id: 1,
      student_id: 1,
      workflow_status: "INVALID_STATUS",
      grade: 8,
      ai_level: 1,
    });

    expect(result.success).toBe(false);
  });
});
