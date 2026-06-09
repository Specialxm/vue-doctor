import path from 'node:path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  isScorePassing,
  renderPullRequestComment,
  ScanError,
  scanPullRequestDiff,
} from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';
import { upsertPullRequestComment } from './post-comment.js';

const parseFailBelow = (value: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new ScanError('fail-below must be a number between 0 and 100');
  }

  return parsed;
};

const run = async (): Promise<void> => {
  const baseBranch = core.getInput('diff') || 'main';
  const failBelow = parseFailBelow(core.getInput('fail-below') || '0');
  const token = core.getInput('github-token', { required: true });
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const directory = core.getInput('directory') || '.';
  const root = path.resolve(workspace, directory);

  const result = await scanPullRequestDiff({
    root,
    rules: allRules,
    baseBranch,
  });

  core.setOutput('score', String(result.score.score));
  core.info(
    `vue-doctor PR scan: ${result.changedFiles.length} changed files, ${result.newIssues.length} new issues, score ${result.score.score}/100`,
  );

  const pullRequest = github.context.payload.pull_request;
  if (pullRequest) {
    const commentBody = renderPullRequestComment(
      result.newIssues,
      result.score,
      result.changedFiles.length,
    );
    const octokit = github.getOctokit(token);

    await upsertPullRequestComment(
      octokit,
      github.context.repo.owner,
      github.context.repo.repo,
      pullRequest.number,
      commentBody,
    );
  } else {
    core.warning('Not a pull_request event — skipping PR comment');
  }

  if (!isScorePassing(result.score.score, failBelow)) {
    core.setFailed(
      `Health score ${result.score.score} is below threshold ${failBelow}`,
    );
  }
};

run().catch((error: unknown) => {
  if (error instanceof ScanError) {
    core.setFailed(error.message);
    return;
  }

  if (error instanceof Error) {
    core.setFailed(error.message);
    return;
  }

  core.setFailed('vue-doctor action failed');
});
