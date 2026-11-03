import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSessionState, formatRelativeTime, parseErrorMessage, formatRepoName, getSessionId } from './julesHelpers.ts';

test('formatSessionState maps states correctly', () => {
  const inProgress = formatSessionState('IN_PROGRESS');
  assert.equal(inProgress.label, 'In Progress');
  assert.match(inProgress.badgeClass, /zinc/);

  const awaiting = formatSessionState('AWAITING_PLAN_APPROVAL');
  assert.equal(awaiting.label, 'Awaiting Approval');
  assert.match(awaiting.badgeClass, /amber/);

  const completed = formatSessionState('COMPLETED');
  assert.equal(completed.label, 'Completed');
  assert.match(completed.badgeClass, /emerald/);
});

test('parseErrorMessage handles 429 rate limits', () => {
  const err = parseErrorMessage(429);
  assert.equal(err.isRateLimit, true);
  assert.match(err.title, /429/);
});

test('parseErrorMessage handles 500 server errors', () => {
  const err = parseErrorMessage(503, 'Service unavailable');
  assert.equal(err.isRateLimit, false);
  assert.match(err.title, /5xx/);
  assert.match(err.detail, /Service unavailable/);
});

test('formatRelativeTime returns valid strings', () => {
  const nowStr = new Date().toISOString();
  assert.equal(formatRelativeTime(nowStr), 'Just now');
});

test('formatRepoName handles undefined, null, and formats cleanly', () => {
  assert.equal(formatRepoName(undefined), 'workspace-repo');
  assert.equal(formatRepoName(null), 'workspace-repo');
  assert.equal(formatRepoName(''), 'workspace-repo');
  assert.equal(formatRepoName('sources/github.com/google/hollow-code'), 'google/hollow-code');
  assert.equal(formatRepoName('sources/my-org/custom-repo'), 'my-org/custom-repo');
  assert.equal(formatRepoName('acme/repo'), 'acme/repo');
});

test('getSessionId handles missing ids and resource names', () => {
  assert.equal(getSessionId(null), 'session');
  assert.equal(getSessionId({ id: 'sess-123' }), 'sess-123');
  assert.equal(getSessionId({ name: 'sessions/sess-456' }), 'sess-456');
  assert.equal(getSessionId({}), 'session');
});

