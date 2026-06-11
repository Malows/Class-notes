import type { Delivery } from "./student";

export interface StudentGridRowDTO {
  id: number;
  name: string;
  deliveries: Delivery[];
}
