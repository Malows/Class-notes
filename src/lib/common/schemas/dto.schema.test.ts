import { describe, expect, test } from "vitest";

import { SaveDeliverySchema } from "./dto.schema";

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
});
