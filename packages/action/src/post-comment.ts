import * as github from '@actions/github';
import { PR_COMMENT_MARKER } from '@vue-doctor/core';

export const upsertPullRequestComment = async (
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
): Promise<void> => {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: pullNumber,
  });

  const existing = comments.find(
    (comment: { body?: string | null; id: number }) =>
      comment.body?.includes(PR_COMMENT_MARKER),
  );

  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    return;
  }

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });
};
