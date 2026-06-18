export type Breadcrumb = {
  key: string;
  href: string;
  label?: string;
  isRaw?: boolean;
};

export type ModalMode = "create" | "edit" | "delete" | null;
