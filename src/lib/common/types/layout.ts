export type Breadcrumb = {
  key: string;
  href: string;
  label?: string;
  isRaw?: boolean;
};

export type ModalMode = "create" | "edit" | "delete" | null;

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
  autoDismiss: boolean;
}
