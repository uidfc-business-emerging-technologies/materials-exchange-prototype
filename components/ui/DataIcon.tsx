import { BookOpen, Database, FileCode, FileSpreadsheet, FileText, KeyRound, Lock, type LucideProps } from "lucide-react";

const MAP = {
  "file-text": FileText,
  "file-spreadsheet": FileSpreadsheet,
  "file-code": FileCode,
  "book-open": BookOpen,
  "key-round": KeyRound,
  database: Database,
  lock: Lock,
} as const;

export type DataIconName = keyof typeof MAP;

/** Renders a Lucide icon named in sample data (file roles, included materials). */
export function DataIcon({ name, ...props }: { name: DataIconName } & LucideProps) {
  const Icon = MAP[name] || FileText;
  return <Icon aria-hidden {...props} />;
}
