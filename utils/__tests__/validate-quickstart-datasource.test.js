'use strict';

import { validateDataSourceIds } from '../validate-quickstart-data-sources';
import Quickstart from '../lib/Quickstart';
import DataSource from '../lib/DataSource';
import * as githubHelpers from '../lib/github-api-helpers';
import * as nrGraphQlHelpers from '../lib/nr-graphql-helpers';

jest.mock('@actions/core');
jest.spyOn(global.console, 'error').mockImplementation(() => {});

jest.mock('../lib/github-api-helpers', () => ({
  ...jest.requireActual('../lib/github-api-helpers'),
  filterQuickstartConfigFiles: jest.fn(),
}));

jest.mock('../lib/nr-graphql-helpers.ts', () => ({
  ...jest.requireActual('../lib/nr-graphql-helpers.ts'),
  getPublishedDataSourceIds: jest.fn(),
}));

jest.mock('../lib/Quickstart');
jest.mock('../lib/DataSource');

const validQuickstartFilename = 'quickstarts/mock-quickstart-2/config.yml';
const invalidQuickstartFilename1 = 'quickstarts/mock-quickstart-1/config.yml';
const invalidQuickstartFilename2 = 'quickstarts/mock-quickstart-3/config.yml';
const validQuickstartWithoutDataSource =
  'quickstarts/mock-quickstart-5/config.yml';

const mockGithubAPIFiles = (filenames) =>
  filenames.map((filename) => ({
    sha: '',
    filename: `utils/mock_files/${filename}`,
    status: 'added',
    additions: 0,
    deletions: 0,
    changes: 0,
    blob_url: '',
    raw_url: '',
    contents_url: '',
    patch: '',
  }));

describe('Action: validate data source id', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    nrGraphQlHelpers.getPublishedDataSourceIds.mockResolvedValueOnce({
      coreDataSourceIds: ['node-js'],
    });
  });

  test('succeeds with valid data source id', async () => {
    const files = mockGithubAPIFiles([validQuickstartFilename]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: ['valid-id'] } };
    });
    DataSource.mockImplementation(() => {
      return { isValid: true };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).not.toHaveBeenCalled();
  });

  test(`succeeds when valid quickstart doesn't contain any data source ids`, async () => {
    const files = mockGithubAPIFiles([validQuickstartWithoutDataSource]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: [] } };
    });
    DataSource.mockImplementation(() => {
      return { isValid: true };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).not.toHaveBeenCalled();
    expect(DataSource).toHaveBeenCalledTimes(0);
  });

  test('succeeds when valid quickstart contains a core data source id', async () => {
    const files = mockGithubAPIFiles([validQuickstartWithoutDataSource]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: ['node-js'] } };
    });
    DataSource.mockImplementation(() => {
      return { isValid: false };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).not.toHaveBeenCalled();
    expect(DataSource).toHaveBeenCalledTimes(0);
  });

  test('fails when nerdgraph responds with an error', async () => {
    nrGraphQlHelpers.getPublishedDataSourceIds.mockReset();

    const files = mockGithubAPIFiles([validQuickstartWithoutDataSource]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    nrGraphQlHelpers.getPublishedDataSourceIds.mockResolvedValueOnce({
      errors: [new Error('test error')],
    });

    nrGraphQlHelpers.getPublishedDataSourceIds.mockResolvedValueOnce({
      errors: [new Error('fake error')],
    });

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: ['node-js'] } };
    });
    DataSource.mockImplementation(() => {
      return { isValid: false };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(2);
    expect(Quickstart).toHaveBeenCalledTimes(0);
    expect(DataSource).toHaveBeenCalledTimes(0);
  });

  test('fails with invalid data source id', async () => {
    const files = mockGithubAPIFiles([invalidQuickstartFilename1]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: ['invalid-id'] } };
    });
    DataSource.mockImplementation(() => {
      return { isValid: false };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(4);
  });

  test('fails with one invalid and one data source id for singular quickstart', async () => {
    const files = mockGithubAPIFiles([invalidQuickstartFilename2]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return { config: { dataSourceIds: ['valid-id', 'invalid-id'] } };
    });
    DataSource.mockImplementationOnce(() => {
      return { isValid: true };
    }).mockImplementationOnce(() => {
      return { isValid: false };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(4);
  });

  test('fails with mix of valid and invalid quickstart', async () => {
    const files = mockGithubAPIFiles([
      invalidQuickstartFilename1,
      invalidQuickstartFilename2,
      validQuickstartFilename,
    ]);
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementationOnce(() => {
      return {
        config: { dataSourceIds: ['invalid-id'] },
      };
    })
      .mockImplementationOnce(() => {
        return {
          config: { dataSourceIds: ['invalid-id-2'] },
        };
      })
      .mockImplementationOnce(() => {
        return {
          config: { dataSourceIds: ['valid-id'] },
        };
      });
    DataSource.mockImplementationOnce(() => {
      return { isValid: false };
    })
      .mockImplementationOnce(() => {
        return { isValid: false };
      })
      .mockImplementationOnce(() => {
        return { isValid: true };
      });

    await validateDataSourceIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(5);
  });

  test('does not fail for deleted quickstart', async () => {
    const removedQuickstartFilename = 'fake-removed-quickstart/config.yml';
    const files = mockGithubAPIFiles([removedQuickstartFilename]);
    files[0].status = 'removed';
    githubHelpers.filterQuickstartConfigFiles.mockReturnValueOnce(files);

    Quickstart.mockImplementation(() => {
      return {
        config: { dataSourceIds: ['valid-id'] },
      };
    });

    await validateDataSourceIds(files);
    expect(global.console.error).toHaveBeenCalledTimes(0);
    expect(Quickstart).toHaveBeenCalledTimes(0);
  });
});
