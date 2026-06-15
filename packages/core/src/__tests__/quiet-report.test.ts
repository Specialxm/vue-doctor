import { describe, expect, it } from 'vitest';
import { renderQuietReport } from '../reporter/terminal.js';
import type { ScanResult } from '../types.js';

const createResult = (score: number): ScanResult => ({
  issues: [],
  projectMeta: {
    root: '/tmp/project',
    name: 'project',
    framework: 'vite',
  },
  durationMs: 10,
  score: {
    score,
    label: 'Healthy',
    errorRuleCount: 0,
    warningRuleCount: 0,
    infoRuleCount: 0,
  },
});

describe('renderQuietReport', () => {
  it('outputs only the numeric score', () => {
    expect(renderQuietReport(createResult(84))).toBe('84\n');
  });
});
