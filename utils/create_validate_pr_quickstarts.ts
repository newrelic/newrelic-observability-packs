import {
  fetchPaginatedGHResults,
  filterOutTestFiles,
  isNotRemoved,
} from './lib/github-api-helpers';
import { translateMutationErrors } from './lib/nr-graphql-helpers';

import Quickstart, { QuickstartMutationResponse } from './lib/Quickstart';
import { CUSTOM_EVENT, recordNerdGraphResponse } from './newrelic/customEvent';
import {
  prop,
  passedProcessArguments,
  getRelatedQuickstarts,
  getComponentLocalPath,
} from './lib/helpers';

import {
  QUICKSTART_CONFIG_REGEXP,
  COMPONENT_PREFIX_REGEXP,
  SUBMIT_THROTTLE_MS,
} from './constants';
import {
  NerdGraphResponseWithLocalErrors,
  NerdGraphError,
} from './types/nerdgraph';
import logger from './logger';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ResponseWithErrors =
  NerdGraphResponseWithLocalErrors<QuickstartMutationResponse> & {
    name: string;
  };

// filter out errors where install plan id does not exist
const installPlanErrorExists = (error: Error | NerdGraphError): boolean =>
  'extensions' in error &&
  error?.extensions?.argumentPath?.includes('installPlanStepIds') &&
  error?.message?.includes('contains an install plan step that does not exist');

const dataSourceErrorExists = (error: Error | NerdGraphError): boolean =>
  'extensions' in error &&
  error?.extensions?.argumentPath?.includes('dataSourceIds') &&
  error?.message?.includes('contains a data source that does not exist');

export const countAndOutputErrors = (
  graphqlResponses: ResponseWithErrors[]
): number =>
  graphqlResponses.reduce((all, { errors, name }) => {
    const installPlanErrors =
      (errors?.filter(installPlanErrorExists) as NerdGraphError[]) ?? [];
    const dataSourceErrors =
      (errors?.filter(dataSourceErrorExists) as NerdGraphError[]) ?? [];
    const remainingErrors =
      errors
        ?.filter((error) => !installPlanErrorExists(error))
        ?.filter((error) => !dataSourceErrorExists(error)) ?? [];

    translateMutationErrors(remainingErrors, name, [
      ...installPlanErrors,
      ...dataSourceErrors,
    ]);

    return all + remainingErrors.length;
  }, 0);

export const createValidateQuickstarts = async (
  ghUrl?: string,
  ghToken?: string,
  isDryRun = false
): Promise<boolean> => {
  if (!ghToken) {
    console.warn('GITHUB_TOKEN is not defined.');
  }

  if (!ghUrl) {
    console.error('Github PR URL is not defined.');
    return false;
  }

  logger.info(`Fetching files for pull request ${ghUrl}`);
  // Get all files from PR
  const files = await fetchPaginatedGHResults(ghUrl, ghToken);

  logger.info(`Found ${files.length} files`);

  // Get all quickstart mutation variables
  const quickstarts = filterOutTestFiles(files)
    .filter(isNotRemoved)
    .map(prop('filename'))
    .filter(
      (filePath) =>
        QUICKSTART_CONFIG_REGEXP.test(filePath) ||
        COMPONENT_PREFIX_REGEXP.test(filePath)
    )
    .flatMap((filePath) => {
      if (QUICKSTART_CONFIG_REGEXP.test(filePath)) {
        return new Quickstart(filePath);
      }

      return getRelatedQuickstarts(getComponentLocalPath(filePath));
    })
    // Remove any duplicate quickstarts
    .reduce<Quickstart[]>((acc, quickstart) => {
      if (!acc.some((a) => a.configPath === quickstart.configPath)) {
        return [...acc, quickstart];
      }

      return acc;
    }, []);

  const invalidQuickstarts = quickstarts
    .map((qs) => {
      qs.validate();
      return !qs.isValid ? qs : undefined;
    })
    .filter(Boolean);

  if (invalidQuickstarts.length > 0) {
    if (require.main === module) {
      process.exit(1);
    }

    return true;
  }

  // Submit all of the mutations in chunks of 5
  let results: ResponseWithErrors[] = [];

  // Class implementations may throw an error
  const quickstartErrors: string[] = [];

  logger.info(`Submitting ${quickstarts.length} quickstarts...`);
  for (const c of quickstarts) {
    try {
      const res = await c.submitMutation(isDryRun);
      await sleep(SUBMIT_THROTTLE_MS);

      results = [...results, res];
    } catch (err) {
      const error = err as Error;

      quickstartErrors.push(error.message);
    }
  }

  const failures = results.filter((r) => r.errors && r.errors.length);

  const errorCount = countAndOutputErrors(failures);

  quickstartErrors.forEach((errorMessage) => console.error(errorMessage));

  const hasFailed = errorCount > 0 || quickstartErrors.length > 0;

  return hasFailed;
};

const main = async () => {
  const [ghUrl, isDryRun] = passedProcessArguments();
  const ghToken = process.env.GITHUB_TOKEN;
  const dryRun = isDryRun === 'true';
  const hasFailed = await createValidateQuickstarts(ghUrl, ghToken, dryRun);

  // Record event in New Relic
  const event = isDryRun
    ? CUSTOM_EVENT.VALIDATE_QUICKSTARTS
    : CUSTOM_EVENT.UPDATE_QUICKSTARTS;

  await recordNerdGraphResponse(hasFailed, event);

  if (hasFailed) {
    process.exit(1);
  }

  logger.info(`Success!`);
};

/**
 * This allows us to check if the script was invoked directly from the command line, i.e 'node create_validate_pr_quickstarts.js', or if it was imported.
 * This would be true if this was used in one of our GitHub workflows, but false when imported for use in a test.
 * See here: https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
 */
if (require.main === module) {
  main();
}
