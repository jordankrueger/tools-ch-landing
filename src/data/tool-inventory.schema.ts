export interface ToolEntry {
  id: string;
  title: string;
  route: string;
  source_app: "pdf" | "image" | "image-pro" | "tools";
  category: "PDF" | "Image" | "Image Pro" | "Quick";
  description: string;
  synonyms: string[];
  vetted_for_launch: boolean;
  appears_on_directory: boolean;
  featured_task?: {
    title: string;
    description: string;
    icon: string;
    icon_variant?: "default" | "orange";
    label: string;
    pill: string;
  };
}

export type ToolInventory = ToolEntry[];
