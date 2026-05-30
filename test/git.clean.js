import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import Git from '../lib/plugin/git/Git.js';
import { factory } from './util/index.js';

describe('git clean robust', () => {
  test('should return true if working dir is clean after refresh', async t => {
    const gitClient = await factory(Git);
    let diffIndexCalled = false;
    let updateIndexCalled = false;

    t.mock.method(gitClient.shell, 'exec', (command) => {
      if (command === 'git update-index -q --refresh') {
        updateIndexCalled = true;
        return Promise.resolve();
      }
      if (command === 'git diff-index --quiet HEAD --') {
        diffIndexCalled = true;
        return Promise.resolve();
      }
      return Promise.resolve();
    });

    const result = await gitClient.isWorkingDirClean();
    assert.equal(result, true);
    assert(updateIndexCalled, 'git update-index should have been called');
    assert(diffIndexCalled, 'git diff-index should have been called');
  });

  test('should return false if working dir is dirty even after refresh', async t => {
    const gitClient = await factory(Git);

    t.mock.method(gitClient.shell, 'exec', (command) => {
      if (command === 'git update-index -q --refresh') {
        return Promise.resolve();
      }
      if (command === 'git diff-index --quiet HEAD --') {
        return Promise.reject(new Error('exit code 1'));
      }
      return Promise.resolve();
    });

    const result = await gitClient.isWorkingDirClean();
    assert.equal(result, false);
  });
});
