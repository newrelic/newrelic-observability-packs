import type {
  NerdGraphError,
  NerdGraphRequest,
  NerdGraphResponseWithLocalErrors,
} from '../types/nerdgraph';

import {
  QuickstartComponentsIdsResponse,
  QuickstartComponentTypename,
} from '../types/QuickstartComponentsIds';

import {
  CATEGORIES_QUERY,
  CORE_DATA_SOURCES_QUERY,
  QUICKSTART_COMPONENTS_IDS_QUERY,
} from '../constants';
import { Policy } from 'cockatiel';
import fetch, { Response } from 'node-fetch';
import logger from '../logger';

/**
 * Build body param for NR GraphQL request
 * @param {{queryString, variables}} queryBody - query string and corresponding variables for request
 * @returns {String} returns the body for the request as string
 */
export const buildRequestBody = <T>({
  queryString,
  variables,
}: NerdGraphRequest<T>): string =>
  JSON.stringify({
    ...(queryString && { query: queryString }),
    ...(variables && { variables }),
  });

// TODO: It would be nice to do this without these weird unions. Let's separate the handling of Javascript errors and nerdgraph errors.
export type ErrorOrNerdGraphError = Error | NerdGraphError;

/**
 * Send NR GraphQL request
 * @param {{queryString, variables}} queryBody - query string and corresponding variables for request
 * @returns {Promise<Object>} An object with the results or errors of a GraphQL request
 */
export const fetchNRGraphqlResults = async <Variables, ResponseData>(
  queryBody: NerdGraphRequest<Variables>,
): Promise<NerdGraphResponseWithLocalErrors<ResponseData>> => {
  const NR_API_URL = process.env.NR_API_URL || '';
  const NR_API_TOKEN = process.env.NR_API_TOKEN || '';

  let results;
  let graphqlErrors: ErrorOrNerdGraphError[] = [];

  // To help us ensure that the request hits and is processed by nerdgraph
  // This will try the request 3 times, waiting a little longer between each attempt
  // It will retry on status codes 400+, 2** would be success and we wouldn't want to retry for a 3**
  const retry = Policy.handleResultType(
    Response,
    (response) => response.status >= 400
  )
    .retry()
    .attempts(3)
    .exponential();

  try {
    const body = buildRequestBody<Variables>(queryBody);

    logger.debug(`Running NerdGraph request...`, { url: NR_API_URL, body });

    const res = await retry.execute(() =>
      fetch(NR_API_URL, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': NR_API_TOKEN,
        },
      })
    );

    logger.debug(`Received status code`, {
      status: res.statusText,
      code: res.status,
    });

    if (!res.ok) {
      graphqlErrors.push(
        new Error(`Received status code ${res.status} from the API`)
      );

      logger.error(`Bad response`, {
        status: res.statusText,
        code: res.status,
      });
    } else {
      const { data, errors } = await res.json();
      results = data;
      if (errors) {
        graphqlErrors = [...graphqlErrors, ...errors];

        // only debug logging here, since we expect validation errors
        // coming back from nerdgraph
        logger.debug(`Received errors from NerdGraph`, { errors });
      }
    }
  } catch (error) {
    graphqlErrors.push(error as Error);
    logger.error(`Request errored out`, { error: error });
  }

  return { data: results, errors: graphqlErrors };
};

/**
 * Handle errors from GraphQL request for quickstart mutation
 * @param {Object[]} errors  - An array of any errors found
 * @param {String} filePath  - The path related to the validation error
 * @param {Object[]}  [installPlanErrors=[]] - Array of install plan errors which are handled differently
 * @returns {void}
 */
export const translateMutationErrors = (
  errors: ErrorOrNerdGraphError[],
  filePath: string,
  componentErrors: NerdGraphError[] = []
): void => {
  console.error(
    `\nERROR: The following errors occurred while validating: ${filePath}`
  );
  errors.forEach((error) => {
    if ('extensions' in error && error.extensions.argumentPath) {
      const errorPrefix = error.extensions.argumentPath.join('/');

      console.error(`- ${errorPrefix}: ${error.message}`);
    } else {
      console.error(`- ${error.message}`);
    }
  });

  if (componentErrors.length > 0) {
    console.error(
      `DEBUG: The following are component errors that occured while validating: ${filePath} and can be safely ignored.`
    );

    componentErrors.forEach((error) => {
      if (error.extensions && error.extensions.argumentPath) {
        const errorPrefix = error.extensions.argumentPath.join('/');

        console.error(`- ${errorPrefix}: ${error.message}`);
      } else {
        console.error(`- ${error.message}`);
      }
    });
  }
};

/**
 * Handle errors from GraphQL request
 * @param {Object[]} errors  - An array of any errors found
 * @returns {void}
 */
export const translateNGErrors = (errors: ErrorOrNerdGraphError[]) => {
  errors.forEach((error) => {
    if ('extensions' in error && error.extensions.argumentPath) {
      const errorPrefix = error.extensions.argumentPath.join('/');

      console.error(`- ${errorPrefix}: ${error.message}`);
    } else {
      console.error(`- ${error.message}`);
    }
  });
};

type CategoryTermsNRGraphqlResults = {
  actor: {
    nr1Catalog: {
      categories: {
        terms: string[];
      }[];
    };
  };
};

/**
 * Method which filters out user supplied keywords to only keywords which are valid categoryTerms.
 * @param {String[] | undefined} configKeywords  - An array of keywords specified in a quickstart config.yml
 * @returns {Promise<String[] | undefined>} An array of quickstart categoryTerms
 *
 * @example
 * // input
 * ['python', 'azure', 'infrastructure', 'banana', 'animal']
 *
 * // return
 * ['azure', 'infrastructure']
 */
export const getCategoryTermsFromKeywords = async (
  configKeywords: string[] | undefined = []
): Promise<string[] | undefined> => {
  logger.debug(`Fetching categories...`);

  // TODO: handles errors!!
  const { data } = await fetchNRGraphqlResults<
    {},
    CategoryTermsNRGraphqlResults
  >({
    queryString: CATEGORIES_QUERY,
    variables: {},
  });
  logger.debug(`Category result`, { data });

  const { categories } = data.actor.nr1Catalog;

  const allCategoryKeywords = categories.flatMap((category) => category.terms);

  const categoryKeywords = configKeywords.reduce<string[]>((acc, keyword) => {
    if (allCategoryKeywords && allCategoryKeywords.includes(keyword)) {
      acc.push(keyword);
    }
    return acc;
  }, []);

  return categoryKeywords.length > 0 ? categoryKeywords : undefined;
};

type CoreDataSourceSearchResults = {
  actor: {
    nr1Catalog: {
      search: {
        results: {
          id: string;
        }[];
      };
    };
  };
};

type GetPublishedDataSourceIdsResponse = {
  coreDataSourceIds: string[];
  errors?: (NerdGraphError | Error)[];
};

export const getPublishedDataSourceIds =
  async (): Promise<GetPublishedDataSourceIdsResponse> => {
    logger.debug(`Fetching all data source Ids`);

    const { data, errors } = await fetchNRGraphqlResults<
      {},
      CoreDataSourceSearchResults
    >({ queryString: CORE_DATA_SOURCES_QUERY, variables: {} });
    logger.debug(`Data source Ids result`, { data, errors });

    const results = data?.actor?.nr1Catalog?.search?.results ?? [];

    const coreDataSourceIds = results.flatMap((result) => result.id);

    return { coreDataSourceIds, errors };
  };

export type ComponentIdsMap = {
  dataSourceIds: string[];
  dashboardIds: string[];
};

export type GetPublishedComponentIdsResult = {
  componentIdsMap: ComponentIdsMap;
  errors?: (NerdGraphError | Error)[];
};

export const getPublishedComponentIds = async (
  quickstartId: string
): Promise<GetPublishedComponentIdsResult> => {
  logger.debug(`Fetching quickstart components for ${quickstartId}`);

  const { data, errors } = await fetchNRGraphqlResults<
    { id: string },
    QuickstartComponentsIdsResponse
  >({
    queryString: QUICKSTART_COMPONENTS_IDS_QUERY,
    variables: { id: quickstartId },
  });
  logger.debug(`Quickstart components result`, { data, errors });

  const {
    metadata: { dataSources, quickstartComponents },
  } = data?.actor?.nr1Catalog?.quickstart;

  const dataSourceIds = dataSources.map((dataSource) => dataSource.id);
  const dashboardIds = quickstartComponents.reduce<string[]>(
    (acc, component) => {
      if (component.__typename === QuickstartComponentTypename.Dashboard) {
        return [...acc, component.id];
      }

      return acc;
    },
    []
  );

  const componentIdsMap = {
    dataSourceIds,
    dashboardIds,
  };

  return { componentIdsMap, errors };
};

/**
 * Breaks an array up into parts, the last part may have less elements
 * @param {Array} array - an array of anything
 * @param {Number} chunkSize - the size of the parts
 * @returns {Array} the array broken out into smaller array chunks
 */
export const chunk = <T>(array: T[], chunkSize: number): T[][] => {
  let chunkedArray: T[][] = [];
  let j = array.length;

  if (chunkSize < 1) {
    return chunkedArray;
  }

  for (let i = 0; i < j; i += chunkSize) {
    chunkedArray = [...chunkedArray, array.slice(i, i + chunkSize)];
  }

  return chunkedArray;
};
