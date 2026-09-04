import { CustomContentItem } from "@/types";
import { ResourcesTable } from "@/components/common/resources-table";

export interface CustomContentTableProps {
  items: CustomContentItem[];
  onDelete: (id: string) => void;
  onEdit: (item: CustomContentItem) => void;
}

export function CustomContentTable({ items, onDelete, onEdit }: CustomContentTableProps) {
  return (
    <ResourcesTable
      mode="custom-content"
      accentColor="blue"
      items={items}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}
