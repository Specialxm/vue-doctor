export const VUE_FILE_GLOB = '**/*.vue';

export const TS_FILE_GLOB = '**/*.{ts,tsx}';

export const IGNORED_DIRS = ['**/node_modules/**', '**/dist/**', '**/.git/**'];

export const MAX_COMPOSABLE_LINES = 150;

export const MAX_COMPONENT_LINES = 300;

export const EMPTY_SCRIPT_TEMPLATE_MIN_LINES = 50;

export const PERFECT_SCORE = 100;

export const ERROR_RULE_PENALTY = 1.5;

export const WARNING_RULE_PENALTY = 0.75;

export const INFO_RULE_PENALTY = 0.25;

export const SCORE_HEALTHY_THRESHOLD = 90;

export const SCORE_ATTENTION_THRESHOLD = 70;

export const SCORE_UNHEALTHY_THRESHOLD = 50;

export const SCANNABLE_FILE_PATTERN = /\.(vue|ts|tsx)$/i;

export const PR_COMMENT_MARKER = '<!-- vue-doctor-report -->';
