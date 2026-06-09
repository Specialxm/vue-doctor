export type Severity = 'error' | 'warn' | 'info';

export type Category = 'architecture' | 'performance' | 'maintainability' | 'security';

export interface Issue {
  ruleId: string;
  severity: Severity;
  file: string;
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
  category: Category;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  category: Category;
  detect: (context: ScanContext) => Issue[];
}

export interface ProjectMeta {
  root: string;
  name: string;
  vueVersion?: string;
  framework: string;
}

export interface VueFileInfo {
  path: string;
  relativePath: string;
  source: string;
  scriptContent: string | null;
  scriptLang: 'ts' | 'js' | null;
}

export interface ScanContext {
  root: string;
  vueFiles: VueFileInfo[];
  projectMeta: ProjectMeta;
}

export interface ScanResult {
  issues: Issue[];
  projectMeta: ProjectMeta;
  durationMs: number;
}

export interface ScanOptions {
  root: string;
  rules: Rule[];
}
