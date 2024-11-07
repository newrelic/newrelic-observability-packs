'use strict';

import { createValidateQuickstarts } from '../create_validate_pr_quickstarts';

import Quickstart from '../lib/Quickstart';
import * as githubHelpers from '../lib/github-api-helpers';

jest.mock('@actions/core');
jest.spyOn(global.console, 'error').mockImplementation(() => {});
jest.spyOn(global.console, 'log').mockImplementation(() => {});

jest.mock('../lib/github-api-helpers', () => ({
  ...jest.requireActual('../lib/github-api-helpers'),
  filterQuickstartConfigFiles: jest.fn(),
  fetchPaginatedGHResults: jest.fn(),
}));

jest.mock('../lib/Quickstart');

const validQuickstartFilename = 'quickstarts/mock-quickstart-2/config.yml';

const mockNGQuickstartErr = (data) => ({
  data,
  errors: [
    {
      extensions: {
        argumentPath: [`slug`],
      },
      message: `slug must be lowercase`,
    },
  ],
});

const mockGithubAPIFiles = (filenames) =>
  filenames.map((filename) => ({
    sha: '',
    filename: `${filename}`,
    status: 'added',
    additions: 0,
    deletions: 0,
    changes: 0,
    blob_url: '',
    raw_url: '',
    contents_url: '',
    patch: '',
  }));

describe('create-validate-pr-quickstarts', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('succeeds on happy path', async () => {
    const files = mockGithubAPIFiles([validQuickstartFilename]);
    githubHelpers.fetchPaginatedGHResults.mockResolvedValueOnce(files);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return {
        config: {},
        isValid: true,
        validate: jest.fn().mockImplementation(() => true),
        submitMutation: jest.fn().mockResolvedValueOnce({
          data: {},
          errors: [],
        }),
      };
    });

    const hasErrored = await createValidateQuickstarts('url', 'token');
    expect(hasErrored).toBe(false);
  });

  test('fails for nerdgraph validation error', async () => {
    const files = mockGithubAPIFiles([validQuickstartFilename]);
    githubHelpers.fetchPaginatedGHResults.mockResolvedValueOnce(files);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return {
        config: {},
        isValid: true,
        validate: jest.fn().mockImplementation(() => true),
        submitMutation: jest
          .fn()
          .mockResolvedValueOnce(mockNGQuickstartErr({})),
      };
    });

    const hasErrored = await createValidateQuickstarts('url', 'token');
    expect(hasErrored).toBe(true);
  });

  test('does not process removed file', async () => {
    const files = mockGithubAPIFiles([validQuickstartFilename]);
    files[0].status = 'removed';
    githubHelpers.fetchPaginatedGHResults.mockResolvedValueOnce(files);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    const hasErrored = await createValidateQuickstarts('url', 'token');
    expect(hasErrored).toBe(false);
  });
});
