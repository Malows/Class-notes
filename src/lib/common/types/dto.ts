import type { Delivery } from "./student";

export interface EnrollmentGridRowDTO {
  id: number;
  enrollment_id: number;
  name: string;
  commission_id?: number;
  deliveries: Delivery[];
}
