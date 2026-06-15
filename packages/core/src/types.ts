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

export interface TsFileInfo {
  path: string;
  relativePath: string;
  source: string;
}

export interface ImportGraph {
  edges: Map<string, Set<string>>;
  reverseEdges: Map<string, Set<string>>;
}

export interface ScanContext {
  root: string;
  vueFiles: VueFileInfo[];
  tsFiles: TsFileInfo[];
  importGraph: ImportGraph;
  projectMeta: ProjectMeta;
}

export interface ScoreResult {
  score: number;
  label: string;
  errorRuleCount: number;
  warningRuleCount: number;
  infoRuleCount: number;
}

export interface ScanResult {
  issues: Issue[];
  projectMeta: ProjectMeta;
  durationMs: number;
  score: ScoreResult;
}

export interface ScanOptions {
  root: string;
  rules: Rule[];
  includeFiles?: string[];
  sourceOverrides?: ReadonlyMap<string, string>;
  ignorePatterns?: string[];
}

export interface DiffScanOptions {
  root: string;
  rules: Rule[];
  baseBranch: string;
  gitRoot?: string;
}

export interface DiffScanResult {
  changedFiles: string[];
  newIssues: Issue[];
  baselineIssues: Issue[];
  currentIssues: Issue[];
  projectMeta: ProjectMeta;
  durationMs: number;
  score: ScoreResult;
}
