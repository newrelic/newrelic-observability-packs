import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as glob from 'glob';

import Component from './Component';

import type {
  AlertType,
  QuickstartAlertInput,
} from '../types/QuickstartMutationVariable';
import type { QuickstartConfigAlert } from '../types/QuickstartConfig';
import type { NerdGraphResponseWithLocalErrors } from '../types/nerdgraph';

import {
  fetchNRGraphqlResults,
  ErrorOrNerdGraphError,
} from './nr-graphql-helpers';

import {
  ALERT_POLICY_REQUIRED_DATA_SOURCES_QUERY,
  ALERT_POLICY_SET_REQUIRED_DATA_SOURCES_MUTATION,
} from '../constants';

import { CUSTOM_EVENT, recordNerdGraphResponse } from '../newrelic/customEvent';

interface RequiredDataSources {
  id: string;
}
interface AlertPolicy {
  id: string;
  metadata?: {
    requiredDataSources: RequiredDataSources[];
  };
}

type AlertPolicyRequiredDataSourcesQueryResults = {
  actor: {
    nr1Catalog: {
      search: {
        results: AlertPolicy[];
      };
    };
  };
};

type AlertPolicyRequiredDataSourcesQueryVariables = {
  query: string;
};

export interface AlertPolicyDataSource {
  id: string;
  dataSourceIds: string[];
}

type AlertPolicySetRequiredDataSourcesMutationVariables = {
  templateId: string;
  dataSourceIds: string[];
};

export type AlertPolicySetRequiredDataSourcesMutationResults = {
  nr1CatalogSetRequiredDataSourcesForAlertPolicyTemplate: {
    alertPolicyTemplate: {
      id: string;
    };
  };
};

export type SubmitSetRequiredDataSourcesMutationResult =
  | NerdGraphResponseWithLocalErrors<AlertPolicySetRequiredDataSourcesMutationResults>
  | { errors: ErrorOrNerdGraphError[] };

class Alert extends Component<QuickstartConfigAlert[], QuickstartAlertInput[]> {
  /**
   * Returns the **directory** for the alert policy
   */
  getConfigFilePath() {
    const filePaths = glob.sync(
      path.join(this.basePath, 'alert-policies', this.identifier)
    );

    if (!Array.isArray(filePaths) || filePaths.length !== 1) {
      this.isValid = false;
      console.error(
        `Alert at ${this.identifier} does not exist. Please double check this location.\n`
      );
      return '';
    }

    return Component.removeBasePath(filePaths[0], this.basePath);
  }

  getConfigContent() {
    if (!this.isValid) {
      return this.config;
    }

    const filePaths = glob.sync(
      path.join(this.basePath, this.configPath, '*.+(yml|yaml)')
    );

    // if there are no YAML files in this directory, it's invalid
    if (!Array.isArray(filePaths) || !filePaths.length) {
      this.isValid = false;
      return this.config;
    }

    // loop through all the YAML files and get their content
    try {
      return filePaths.map((filepath) => {
        const file = fs.readFileSync(filepath);

        return yaml.load(file.toString('utf-8')) as QuickstartConfigAlert;
      });
    } catch (e) {
      console.log(`Unable to parse YAML config for alert: ${this.configPath}`);
      this.isValid = false;

      return this.config;
    }
  }

  getMutationVariables() {
    if (!this.isValid) {
      console.error(
        `Alert is invalid.\nPlease check if the path at ${this.identifier} exists.`
      );
      return [];
    }

    return this.config.map((condition) => {
      const { description, name, type } = condition;

      return {
        description: description && description.trim(),
        displayName: name && name.trim(),
        rawConfiguration: JSON.stringify(condition),
        sourceUrl: Component.getAssetSourceUrl(this.configPath),
        type: type && (type.trim() as AlertType),
      };
    });
  }

  /**
   * Static method that gets the alert policy associated with a quickstart and it's current data sources
   * @returns - object with alert policy ids, required data sources and NG errors
   */
  static async getAlertPolicyRequiredDataSources(quickstart: {
    name: string;
    dataSourceIds: string[];
  }): Promise<
    | { alertPolicy: AlertPolicyDataSource }
    | { alertPolicy: null; errors: ErrorOrNerdGraphError[] }
  > {
    const { data, errors } = await fetchNRGraphqlResults<
      AlertPolicyRequiredDataSourcesQueryVariables,
      AlertPolicyRequiredDataSourcesQueryResults
    >({
      queryString: ALERT_POLICY_REQUIRED_DATA_SOURCES_QUERY,
      variables: { query: `${quickstart.name} alert policy` },
    });

    const results = data?.actor?.nr1Catalog?.search?.results;
    const hasFailed = quickstart.dataSourceIds.length > 1;

    if (errors && errors.length > 0) {
      return { alertPolicy: null, errors };
    }

    if (results === undefined || results.length === 0) {
      console.log(`No alert policy for quickstart ${quickstart.name} exists`);

      return { alertPolicy: null, errors: [] };
    }

    if (hasFailed) {
      console.log(
        `Multiple Quickstart data sources detected for Quickstart: ${quickstart.name} with AlertPolicy: ${results[0].id} must update manually`
      );

      recordNerdGraphResponse(
        hasFailed,
        CUSTOM_EVENT.MULTIPLE_DATA_SOURCES_DETECTED,
        quickstart.name
      );

      return { alertPolicy: null, errors: [] };
    }

    const alertPoliciesWithUpdatedDataSources = results.map(
      (result: AlertPolicy) => {
        const currDataSourceIds =
          result?.metadata?.requiredDataSources.map(
            (dataSource) => dataSource.id
          ) ?? [];

        return {
          id: result.id,
          dataSourceIds: [
            ...new Set([...currDataSourceIds, ...quickstart.dataSourceIds]),
          ],
        };
      }
    );

    return { alertPolicy: alertPoliciesWithUpdatedDataSources[0] };
  }

  /**
   * Static method of mutating alert policy with updated required data sources
   * @returns - Object with the alert policy template id or errors
   */
  static async submitSetRequiredDataSourcesMutation(
    templateId: string,
    dataSourceIds: string[]
  ) {
    const result = await fetchNRGraphqlResults<
      AlertPolicySetRequiredDataSourcesMutationVariables,
      AlertPolicySetRequiredDataSourcesMutationResults
    >({
      queryString: ALERT_POLICY_SET_REQUIRED_DATA_SOURCES_MUTATION,
      variables: { templateId, dataSourceIds },
    });

    return result;
  }
}

export default Alert;
