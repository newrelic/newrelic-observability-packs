# Contributing

<!-- toc -->

- [Contributing](#contributing)
  - [Welcome 👋](#welcome-)
  - [Quickstarts contributor guidelines](#quickstarts-contributor-guidelines)
    - [Quickstart PR review workflow](#quickstart-pr-review-workflow)
    - [Pull requests](#pull-requests)
    - [Contributor license agreement](#contributor-license-agreement)
  - [Quickstart definitions](#quickstart-definitions)
    - [Quickstarts](#quickstarts)
    - [Dashboards](#dashboards)
    - [Alerts](#alerts)
    - [Install plans](#install-plans)
    - [Data sources](#data-sources)
  - [Quickstart Preview](#quickstart-preview)
    - [Local Quickstart Preview](#local-quickstart-preview)
      - [Step-by-step guide to view Local Quickstart Preview](#step-by-step-guide-to-view-local-quickstart-preview)
    - [Pull Request Quickstart Preview](#pull-request-quickstart-preview)
  - [Support](#support)
    - [Feature requests](#feature-requests)
    - [Slack](#slack)
    - [Partnerships](#partnerships)
    <!-- tocstop -->

## Welcome 👋

Contributions are always welcome. Before contributing please read the
[code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md)
and [search the issue tracker](../../issues); your issue may have already been discussed or fixed in `main`. To contribute,
[fork](https://help.github.com/articles/fork-a-repo/) this repository, commit your
changes, and [send a Pull Request](https://help.github.com/articles/using-pull-requests/).

Note that our [code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md)
applies to all platforms and venues related to this project; please follow it in all
your interactions with the project and its participants.

## Quickstarts contributor guidelines

> Review our comprehensive [Developer Guide](https://developer.newrelic.com/contribute-to-quickstarts/) to get starting building your quickstart!

We encourage all contributors to actively engage in the creation and maintenance of quickstarts. Whether you work at New Relic or use New Relic as a customer, the community is open to your expertise!

- `Step 1`: Review the [quickstart definitions section](#quickstart-definitions) and the [quickstart Template Config](./_template/quickstarts/example-quickstart/config.yml) for a definition of how to create a quickstart.
- `Step 2`: Review the [documentation](https://github.com/newrelic/newrelic-quickstarts/blob/main/docs) for structure and limits you need to consider.
- `Step 3`: Create your quickstart!
- `Step 4`: Submit a PR!
- `Step 5`: Resolve feedback from code reviews.
- `Step 6`: After approval, merge your PR.

### Quickstart PR review workflow

When you submit a PR for a new our existing quickstart the follow workflow is executed.

- `Step 1`: A new PR is added the `To do` column of the [NR1 Community Quickstarts project board](https://github.com/newrelic/newrelic-quickstarts/projects/3)
- `Step 2`: A repo maintainer will review the PR and provided feedback. The PR will move to the `In progress` column.
- `Step 3`: Once a review is complete the PR will move to `In review` column and `in-review` label will be applied.
- `Step 4`: When all review feedback is resolved the PR will be merged and moved to the `Done` column and a `released` label will be applied.

### Pull requests

1. Provide a short description of the changes and screenshots of any visual changes.
2. Ensure that all status checks are passing.
3. You may merge the Pull Request in once you have the sign-off of one other developer, or if you do not have permission to do that, you may request the reviewer to merge it for you.
4. Once your PR is merged, changes should be reflected both in the Public Catalog and in New Relic One I/O within `4 hours`

### Contributor license agreement

Keep in mind that when you submit your Pull Request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.

For more information about CLAs, please check out Alex Russell's excellent post,
["Why Do I Need to Sign This?"](https://infrequently.org/2008/06/why-do-i-need-to-sign-this/).

## Quickstart definitions

### Quickstarts

Quickstarts are higher level "bundles" of dashboards and alerts (components), plus the instrumentation required to power them. Some examples of things that should be quickstarts are Ruby on Rails, the LAMP stack, or Wordpress.

They are defined under the `quickstarts/` directory and can be nested under organizational directories such as `aws`, `logging`, or `kuberneters`. Each quickstart has a `config.yml` file that defines metadata, components, install plans, and data sources.

```yaml
# quickstarts/example-category/example-quickstart/config.yml

# This is automatically created by the system, this field should not be included by the author when creating a new quickstart.
id: 00000-0000-0000-0000000

slug: example-quickstart

# Used as the display name for the quickstart
title: Example quickstart

description: |
  ## Long form description
  * with 
  * markdown
  * support

summary: |
  Short form summary of the quickstart. Limited to one or two sentences.

# Possible values: New Relic | Verified | Community
# Please consult with pull request reviewers if you think your quickstart should have a support level other than "Community"
level: Community

authors:
  - Author One
  - Other Author

keywords:
  - list
  - of
  - searchable
  - strings

# Relevant documentation for this quickstart
documentation:
  - name: Installation docs
    url: docs.newrelic.com
    description: Short description of the documentation link

# An icon or logo for the quickstart
icon: icon.svg

# References to dashboards by file path, the first entry references a dashboard located at `dashboards/example-dashboard`
# For more information on dashboard definitions, see the section below.
dashboards:
  - example-dashboard
  - another-example-dashboard

# References to alert policies by file path, the first entry references an alert policy located at `alerts-policies/example-alert-policy`
# For more information on alert policy definitions, see the section below.
alertPolicies:
  - example-alert-policy
  - another-example-alert-policy

# References to install plan IDs (**NOTE**: Not the file path)
# The Ordering of installPlans is important as it sets the order of installation.
installPlans:
  - example-install-plan-id

# References to data sources by file path, this references a data source located at `data-sources/example-data-source`
# For more information on data source definitions, see the section below.
dataSources:
  - example-data-source
```

_Note:_ For a quickstart to be "installable" through New Relic, it must have an install plan.

An example quickstart directory looks like this:

```bash
# in quickstarts/example directory
# Note: a nested directory is also valid, quickstarts/example/getting-started
config.yml
icon.png
```

#### Fields

| field         | required? | default                                                           | description                                                                                                |
| ------------- | --------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| id            | yes       |                                                                   | A UUID for the quickstart, this is generated by the system and should _not_ be provided by the contributor |
| slug          | no        | The title in lowercase with spaces and special characters removed | Used to reference the quickstart in URLs, should not be changed after creation                             |
| title         | yes       |                                                                   | Used as the display name for the quickstart                                                                |
| description   | yes       |                                                                   | The long form description of the quickstart, has support for markdown syntax                               |
| summary       | yes       |                                                                   | The short form description of the quickstart, should be under 250 characters                               |
| level         | no        | `Community`                                                       | The support level for the quickstart, possible values are `New Relic`, `Verified`, and `Community`         |
| authors       | yes       |                                                                   | A list of authors for the quickstart                                                                       |
| keywords      | no        |                                                                   | A list of terms for searching within the catalogue                                                         |
| documentation | no        |                                                                   | A list of related documentation for the quickstart                                                         |
| icon          | no        | An image generated using the initials of the quickstart title     | Used to denote the quickstart within the catalogue                                                         |
| dashboards    | no        |                                                                   | A list of dashboards to include in this quickstart                                                         |
| alertPolicies | no        |                                                                   | A list of alert policies to include in this quickstart                                                     |
| installPlans  | no        |                                                                   | A list of install plans, at least one is required to allow this quickstart to be installed                 |
| dataSources   | no        |                                                                   | A list of data sources                                                                                     |

#### Style tips

- Maintain a strong active voice. Lead sentences with verbs.
  - Avoid "Allows you to monitor your uptime"
- Avoid being too formal. Avoid words like `thus` and `lastly`, and feel free to use `we` and `our`.
- In general, we should only lightly touch on what a given technology does. The user is already using Node, so we don't need to sell them on it exactly. What we need to focus on is the challenges of monitoring that technology and then sell on that.

Check out our [doc team's voice and tone guidelines](https://docs.newrelic.com/docs/style-guide/writing-guidelines/voice-strategies-docs-sound-new-relic/).

#### Quickstart description prose template

```md
## Why monitor <QUICKSTART_TECHNOLOGY>

Explain the role and purpose of monitoring your technology. What are some specific difficulties about the technology? What are useful metrics to monitor?

### <QUICKSTART_TECHNOLOGY> quickstart highlights

Describe the specific features of your quickstart. Mentions things such as dashboard visuals, alerts, and the type of instrumentation. We recommend the following format:

Quick intro sentence:

- First highlight
- Second highlight
- Third highlight

### New Relic + <QUICKSTART_TECHNOLOGY> (Optional)

Describe how New Relic's capabilities can assist in monitoring your technology outside of what is included in the quickstart. Mention capabilities such as errors inbox, transaction traces, etc.
```

#### Quickstart usage

When writing about a quickstart the following language rules should be followed:

1. Capitalize the term quickstart if the word is at the start of a sentence or header.
   > "Quickstarts are a great way to get started with New Relic!"
1. If the term quickstarts is anywhere else in a sentence, use lower case.
   > "New Relic offers you a wide range of quickstarts to get you started."
1. Quickstarts is always a single word.
   > "Always use quickstarts, not quick starts."

#### Authors

Quickstart authors represent the creator of the quickstart.

You can define multiple author names, but it's recommended to use one of the follow formats.

1. company name
2. company name + author name
3. author name

#### Slug & title fields

`https://newrelic.com/instant-observability/{slug}/{id}`

The quickstart `slug` field defines the URL for the [instant-observability website](https://newrelic.com/instant-observability/). It's important that you don't change the name after the quickstart has been created as the URL will break, and return a 404 if this field changes. Another important note is that `slug` must be all lower case and kebab-case.

Example:

```yml
slug: this-is-kebab-case-and-lower-cased
```

> We will soon handle redirects more effectively for the I/O site to account for name changes.

The quickstart `title` field defines the display name of the quickstart in the UI and can be changed.

#### Summary & descriptions

> See the generated [docs](https://github.com/newrelic/newrelic-quickstarts/blob/main/docs/graphql-schema-docs.md#nr1catalogquickstartmetadata) for more details on `description` and `summary`.

- Use the proper YAML formatting `|` for URL `description` and `summary`.
- Please review the [YAML cheat sheet](https://lzone.de/cheat-sheet/YAML) for more details.
- Descriptions shouldn't have `H1` `#` headers, and all `H1` `#` headers will be rendered to `H2` `##` by default.
- Use only 1 `H2` `##` as your top header.
- Use `H3` `###` only throughout the rest of your description. As the markdown only supports up to `H3` `###`.

```yml
description: |
  a description of the quickstart.

summary: |
  a summary of the quickstart.
```

#### Documentation

- The first `documentation URL` listed in the documentation configuration should be the primary doc reference.
- The see installation docs buttons will always link to the primary `documentation URL`.
- Every quick start that should be "installable" needs a `documentation URL` and an `installPlan` configuration if you want use the guided install flow.
- Use the proper YAML formatting `|` for the URL description
- Use the proper YAML formatting `>-` for documentation URL references.
- Please review the [YAML cheat sheet](https://lzone.de/cheat-sheet/YAML) for more details.

```yaml
documentation:
  - name: Name of documentation
    description: |
      Description of documentation
    url: >-
      https://docs.newrelic.com/docs/url/
```

#### Support Levels

- All quickstarts will be set to `Community` level by default unless specified differently by the `Author`.
- Levels can only be modified by New Relic employees.
- If you have questions on how to increase the level of support please file an [issue](../../issues)
- The shield icon is only applied to those quickstarts with support level `New Relic` OR support Level `Verified`.
- In most cases a quickstart that is referencing an [experimental open source project](https://github.com/newrelic-experimental) should be set to the `Community` level.
- If you are referencing an experimental project and want to set the quickstart to `Verified` please be aware of the support requirements below.

**New Relic:**

- Verified for quality by New Relic
- Created by New Relics employees
- Supported by New Relic

**Verified:**

- Verified for quality by New Relic
- Created by New Relics employees or partners
- Supported by individual authors or partners

**Community:**

- Contributed & supported by the community
- Created by community members
- Supported by individual authors and community members

#### Icons

> If you don't have a icon for your quickstart, you can use a [generic new relic icon](./images/newrelic-generic-logo.svg).

- Icon files should go in the root quickstart directory, `/quickstarts_name01`
- Icon are `required` and are used in both the Public Catalog and in New Relic One.
- `.png` or `.jpeg` or `.svg` format
- Max 1
- Aspect ratio: 1:1
- 250px (width) x 100px (height)

### Data Sources

Data sources are optional. When adding a data source the following format should be used. Each entry in the list is the path to a data source under the [data-sources](./data-sources) directory. Example: for `argocd` located at `data-sources/argocd/config.yml`, you would add the `argocd` part to your list of data sources.

```yml
dataSources:
  - argocd
  - postman
```

### Keywords

When adding keywords to a quickstart the following format should be used. Keywords are used in UI navigation, filters and labels within
the New Relic One I/O Catalog and the External I/O Catalog.

```yml
keywords:
  - a keyword
  - another keyword
  - yet another keyword
```

Keywords are strictly defined and you should provide a standard set of keywords in your quickstarts. If you submit a keyword
that is not defined in this list below, it will be reviewed for use after you submit a PR.

> the `featured` keyword is used to feature quickstarts. It can only be set by a New Relic employee.
> the `newrelic partner` keyword is used to feature quickstarts. It can only be set by a New Relic employee.

- apm
- automation
- cms
- containers
- content management system
- database
- golang
- infrastructure
- java
- kubernetes
- language agent
- load balancer
- messaging
- mobile
- .net
- networking
- newrelic
- newrelic partner
- node.js
- os
- operating system
- open source monitoring
- php
- python
- queue
- ruby
- synthetics
- testing
- tracing
- windows

### Dashboards

> **Note**: The JSON representation of a dashboard that is stored within this repository is NOT valid for importing into New Relic. 
> To make one of these JSON files importable, you must set the `permissions` field (on the same level as the `name` and `pages` to `PUBLIC_READ_WRITE` and update all the instances of `accountId` to be your New Relic account id. 
> To quickly update all the `accountId`s you can use `sed -i -e 's/accountId": 0/accountId": <your account id>/g' <path to the dashboard JSON file>` (without the `<` `>` characters)

Dashboards are defined under the `dashboards/` directory and CANNOT be nested, a dashboard named `example-dashboard` would live under `dashboards/example-dashboard`. They're defined using a JSON file and a set of screenshots. The dashboard JSON file is generated by exporting a dashboard from New Relic as JSON and removing/updating a few fields.

To convert an exported dashboard to the correct schema:

1. Remove the `permissions` field
2. Set every instance of `accountId` to `0`
3. Set every instance of `linkedEntityGuids` to `null`

We provide a handy script to do this for you:

1. Make sure you have `Node 16` or later and `Yarn`
2. Go into the `utils` directory: `cd utils`
3. Install dependencies: `yarn install`
4. Run `yarn sanitize-dashboard example-dashboard`

An example dashboard configuration looks like this:

```bash
# in dashboards/example-dashboard directory
example-dashboard.json
example-screenshot1.png
exmaple-screenshot2.png
```

#### Dashboard JSON Fields

| field       | required? | default | description                                                                                                                         |
| ----------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| name        | yes       |         | The name of the dashboard, must be unique across all dashboards in the system. Name uniqueness will be checked at pull request time |
| description | no        |         | A nice description of the dashboard, displayed in the catalogue                                                                     |
| pages       | yes       |         | The main configuration for the dashboard, generated when exporting from New Relic                                                   |

#### Dashboard Permissions

- When copying dashboard JSON from the New Relic One platform a `permissions` field is always included in the code. You do not need this in a quickstart's dashboard JSON.
- However if you wish to import a quickstart's dashboard into New Relic outside of the quickstart installation flow, you will need to include this `permissions` field.
- Refer to this [documentation](https://docs.newrelic.com/docs/query-your-data/explore-query-data/dashboards/dashboards-charts-import-export-data/) on importing / exporting dashboards from the New Relic One platform.

```json
{
  "name": "Dashboard Name",
  "description": null,
  "permissions": "PUBLIC_READ_WRITE"
}
```

#### Dashboard name uniqueness

- A dashboard's name must be unique. After providing a name in the `dashboard.json` file, you can check if your dashboard's name already exists by running `yarn run check_dashboard_name_uniqueness` from the `utils` directory.
- this [script](https://github.com/newrelic/newrelic-quickstarts/blob/main/utils/check_dashboard_name_uniqueness.js) will check and notify you of duplicate dashboard names in the repository.
- As a best practice you should run this script when creating a new dashboard.

#### Dashboard screenshots

- Dashboard images are `optional` but highly recommended to preview the visual functionality of a dashboard.
- File name should be `dashboard_name01`, `dashboard_name02`, etc
- Dashboards images should be stored in that dashboard's directory with its JSON file. ex: `dashboards/dashboard_name/dashboard_name01.png`.
- Must be in `.png`, `.jpg`, or `.jpeg` format
- Each image file must be less than `4MB` in size, _please_ optimize your screenshots for the web
- There should be no more than `12` dashboard or images per quickstart
- For best results use aspect ratio: 16:9
- For best results use 800 px (width)
- For best results use 450 px (height)

### Alerts

Alerts are defined as policies, which are composed of multiple alert conditions. They are located under the `alert-policies/` directory and CANNOT be nested, an alert policy named `example-policy` would live under `alert-policies/example-policy`. Each condition within a policy is defined using a yaml file. For more information on creating New Relic alert conditions, see [Introduction to alerts](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/learn-alerts/introduction-alerts)

```yaml
name: Example alert condition

# Description and details
description: |
  Describe the purpose of this alert condition.
  You can use multiple lines.
  Try to be as descriptive as possible and provide "The Why".

# Type of alert: BASELINE | STATIC
type: BASELINE

# NRQL query
nrql:
  # Baseline alerts can use an optional FACET
  query: "FROM Metric SELECT average(metric.name) FACET entity.name"

# Direction in which baseline is set (Default: LOWER_ONLY)
baselineDirection: LOWER_ONLY | UPPER_AND_LOWER | UPPER_ONLY

# List of Critical and Warning thresholds for the condition
terms:
  - priority: CRITICAL
    # Operator used to compare against the threshold.
    operator: ABOVE
    # Value that triggers a violation
    threshold: 3
    # Time in seconds; 120 - 3600, must be a multiple of 60 for Baseline conditions
    thresholdDuration: 60
    # How many data points must be in violation for the duration
    thresholdOccurrences: ALL | AT_LEAST_ONCE

  # Adding a Warning threshold is optional
  - priority: WARNING
    operator: ABOVE
    threshold: 1
    thresholdDuration: 300
    thresholdOccurrences: ALL | AT_LEAST_ONCE

# Loss of Signal Settings
expiration:
  # Close open violations if signal is lost (Default: false)
  closeViolationsOnExpiration: true | false
  # Open "Loss of Signal" violation if signal is lost (Default: false)
  openViolationOnExpiration: true | false
  # Time in seconds; Max value: 172800 (48hrs), null if closeViolationsOnExpiration and openViolationOnExpiration are both 'false'
  expirationDuration:

# Advanced Signal Settings
signal:
  # Max Value for Baseline conditions = 20
  evaluationOffset: 3
  # Type of value that should be used to fill gaps
  fillOption: LAST_VALUE | NONE | STATIC
  # Integer; Used in conjunction with STATIC fillOption, otherwise null
  fillValue:

# OPTIONAL: URL of runbook to be sent with notification
runbookUrl:

# Duration after which a violation automatically closes
# Time in seconds; 300 - 2592000 (Default: 86400 [1 day])
violationTimeLimitSeconds: 86400
```

An example alert policy looks like this:

```bash
# in alert-policies/example-policy directory
example-alert-condition.yml
example-alert-condition2.yml
```

#### Alert condition fields

| field       | required? | default | description                                         |
| ----------- | --------- | ------- | --------------------------------------------------- |
| name        | yes       |         | The name of the alert, for display within New Relic |
| description | no        |         | A description for the alert                         |

For documentation on the rest of the alert condition fields, please review the [Introduction to alerts](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/learn-alerts/introduction-alerts)

### Install plans

Install plans define how to get data into New Relic. They are located under the `install/` directory and can be nested. Example: `install/third-party/netlify/install.yml`.

```yaml
# in install/example/install.yml

# Defined by the author, must be unique
id: example-install-1

# A human readable name
name: Example Install Plan

# Used as a heading during the install process
title: Example Install Plan

description: |
  A short description of what this plan does

target:
  # type can be agent | integration | on_host_integration | unknown
  type: agent
  # destination can be application | cloud | host | kubernetes | unknown
  destination: host
  # os can be darwin | linux | windows
  os:
    - linux
    - windows

install:
  mode: targetedInstall
  destination:
    recipeName: test-install-installer

fallback:
  mode: link
  destination:
    url: https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent/linux-installation/install-infrastructure-monitoring-agent-linux/#manual-install
```

An example install plan directory looks like this:

```bash
# in install/example-install directory
install.yml
```

#### Install plan fields

| field               | required? | default | description                                                                                                                                                                                                                               |
| ------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                  | yes       |         | User defined id for the install plan, must be unique                                                                                                                                                                                      |
| name                | yes       |         | The human-readable name for the install plan                                                                                                                                                                                              |
| title               | yes       |         | Used as the heading for this step in the install process                                                                                                                                                                                  |
| description         | yes       |         | A short form description of the install plan                                                                                                                                                                                              |
| target              | yes       |         | Context about where the install will occur                                                                                                                                                                                                |
| target.type         | yes       |         | The type of installation. Options are one of `agent`, `integration`, `on_host_integration`, or `unknown`                                                                                                                                  |
| target.destination  | yes       |         | The location of the installation. Options are one of `application`, `cloud`, `host`, `kubernetes`, or `unknown`                                                                                                                           |
| target.os           | yes       |         | The operating system of the installation target. Options are one of `darwin`, `linux`, or `windows`                                                                                                                                       |
| install             | yes       |         | The primary installation method. See [Install fields](#install-fields) for examples on how to use the `destination` field                                                                                                                 |
| install.mode        | yes       |         | The type of installation. Options are one of `link`, `nerdlet`, or `targetedInstall`                                                                                                                                                      |
| install.destination | yes       |         | The destination of the installation. Based on the chosen install `mode`, options are `recipeName` for the `targetedInstall` mode, `url` for the `link` mode, or `nerdletId`, `nerdletState`, and `requiresAccount` for the `nerdlet` mode |
| fallback            | no        |         | Uses the same fields as `install`                                                                                                                                                                                                         |

#### Install fields

- `targetedInstall`

  - Uses the New Relic CLI to install instrumentation
  - Example:

  ```yaml
  install:
    mode: targetedInstall
    destination:
      recipeName: fake-install-recipe
  ```

- `nerdlet`

  - Directs the user to a nerdlet to finish installing instrumentation
  - Example:

  ```yaml
  install:
    mode: nerdlet
    destination:
      nerdletId: some-nerdlet.id
      nerdletState:
        optionalKey: optional-value
      requiresAccount: true
  ```

- `link`
  - Directs the user to a documentation link to finish installing instrumentation
  - Example:
  ```yaml
  install:
    mode: link
    destination:
      url: https://docs.newrelic.com
  ```

### Data sources

Data sources represent a _single_ type of instrumentation, such as an agent, attributes on a transaction, a cloud provider integration, a third-party integration, etc.
They can be broken out into two categories, CORE and COMMUNITY. The CORE data sources are provided by New Relic One and do _not_ exist within this repository, the COMMUNITY data sources _are_ defined within this repository.

COMMUNITY data sources live in the `data-sources/` directory and _CANNOT_ be nested. Example: `data-sources/example/config.yml`

```yaml
# A unique identifier for the data source
id: example

# Display name for the data source
displayName: Example Data Source

description: |
  test

install:
  primary:
    nerdlet:
      nerdletId: test.test-nerdlet
      nerdletState:
        test_state: test
      requiresAccount: true
  fallback:
    link:
      url: https://newrelic.com

# An icon for display within the catalog
icon: icon.png

# Searchable words or phrases
keywords:
  - test
  - keyword2

# Terms related to the categories for the data source
categoryTerms:
  - test
  - term2
```

An example data source directory looks like this:

```bash
# in data-sources/example directory
config.yml
icon.png
```

#### Data source fields

| field               | required? | default | description                                                                                                                                                                               |
| ------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                  | yes       |         | User defined id for the data source, must be unique                                                                                                                                       |
| displayName         | yes       |         | The human-readable name for the data source                                                                                                                                               |
| description         | no        |         | A short form description of the data source                                                                                                                                               |
| icon                | yes       |         | The path to an icon for the data source. The icon should follow the sizing conventions of the [quickstart icon](#icons)                                                                   |
| keywords            | no        |         | A list of keywords for searching and filtering the catalogue                                                                                                                              |
| categoryTerms       | no        |         | A list of terms that relate to categories within the catalogue, this controls which categories the data source shows up under                                                             |
| install             | yes       |         | The primary installation method. See [Install fields](#install-fields) for examples on how to use the `destination` field. _Note_: Data sources do not support the `targetedInstall` mode |
| install.mode        | yes       |         | The type of installation. Options are one of `link` or `nerdlet`                                                                                                                          |
| install.destination | yes       |         | The destination of the installation. Based on the chosen install `mode`, `url` for the `link` mode, or `nerdletId`, `nerdletState`, and `requiresAccount` for the `nerdlet` mode          |
| fallback            | no        |         | Uses the same fields as `install`                                                                                                                                                         |

## Quickstart Preview

Quickstart Previews are available for contributors to review their new or improved quickstarts directly from the Public I/O site! We provide two ways to view a preview:

### Local Quickstart Preview

- To view a local quickstart preview, you can run the command `yarn preview node-js/express` or `yarn preview catchpoint` using the _path_ to the quickstart within the `quickstarts/` directory.
- This script needs to be run under the `utils` directory.
- The script will run a local server for the Public I/O site to fetch files from the specified quickstart.
- The command line will provide a link that can be navigated to view the quickstart.
  - In order for local quickstart preview to be enabled on the Public I/O site, there needs to be a `config.yml` file present in the quickstart directory. However, there does not need to have any content inside the file.
  - _Only one quickstart may be served for local quickstart preview_

> Note: While working on a quickstart, changes may not be updated in the local preview automatically. If you do not see immediate changes, refresh the page to pull in recent updates.

#### Step-by-step guide to view Local Quickstart Preview

Starting from the top level of the repository: `newrelic-quickstarts`

```bash
cd utils
yarn install
yarn preview aws/amazon-msk
```

> Note: `aws/amazon-msk` is just an example. It can be replaced with the path to any quickstart.

## Support

### Pull Request Quickstart Preview

- Once a PR is open for a quickstart, a comment will be automatically generated with a link to the quickstart associated with the PR.
- If a PR has multiple quickstarts, a link will be generated in the PR for each quickstart.

### Feature requests

Feature requests should be submitted in the [Issue tracker](../../issues), with a description of the expected behavior & use case, where they'll remain closed until sufficient interest, [e.g. :+1: reactions](https://help.github.com/articles/about-discussions-in-issues-and-pull-requests/), has been [shown by the community](../../issues?q=label%3A%22votes+needed%22+sort%3Areactions-%2B1-desc).
Before submitting an Issue, please search for similar ones in the
[closed issues](../../issues?q=is%3Aissue+is%3Aclosed+label%3Aenhancement).

### Slack

We host an internal help [Slack channel](https://newrelic.slack.com/archives/C02CM0D5QBF). You can contact the teams supporting quickstarts and I/O with any questions here.

### Partnerships

Many of our quickstarts are built by our I/O Ecosystem partners. If you have interest in partnering with New Relic on a developing a quickstart create an [issue](../../issues) in the repository and we will follow up on the request.
