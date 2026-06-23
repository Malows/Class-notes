import type { Delivery } from "./student";

export interface StudentGridRowDTO {
  id: number;
  name: string;
  commission_id?: number;
  deliveries: Delivery[];
}
