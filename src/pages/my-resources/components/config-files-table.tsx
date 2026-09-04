import { CustomFileItem } from "@/types";
import { ResourcesTable } from "@/components/common/resources-table";

export interface ConfigFilesTableProps {
  items: CustomFileItem[];
  onDelete: (id: string) => void;
  onEdit: (item: CustomFileItem) => void;
}

export function ConfigFilesTable({ items, onDelete, onEdit }: ConfigFilesTableProps) {
  return (
    <ResourcesTable
      mode="custom-file"
      accentColor="amber"
      items={items}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}
