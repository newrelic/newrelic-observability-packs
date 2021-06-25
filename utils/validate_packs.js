'use strict';
const path = require('path');
const glob = require('glob');
const Ajv = require('ajv');
const ajv = new Ajv();

const { readPackFile, removeCWDPrefix } = require('./helpers');

// schemas
const mainConfigSchema = require('./schemas/main_config.json');
const alertSchema = require('./schemas/alert_config.json');
const dashboardSchema = require('./schemas/dashboard_config.json');
const flexConfigSchema = require('./schemas/flex_config.json');
const flexIntegrationsSchema = require('./schemas/flex_integrations.json');
const syntheticSchema = require('./schemas/synthetic_config.json');

const EXCLUDED_DIRECTORY_PATTERNS = [
  'node_modules/**',
  'utils/**',
  '*',
];

/** 
* Validates an object against a JSON schema
* @param {Object} content - The object to validate
* @param {Object} schema - Json schema used for validation.
* @returns {Object[]} An array of any errors found
*/
const validateAgainstSchema = (content, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(content);

  if (!valid) {
    return validate.errors;
  }

  return [];
}

/**
 * Validates a files contents against the appropriate schema
 * @param {Object} file - an object containing the path and contents of a file
 * @returns {Object} the same file object with an array of `errors`
 */
const validateFile = (file) => {
  const filePath = file.path;
  let errors = [];

  console.log(`Validating ${removeCWDPrefix(filePath)}`);
  switch(true) {
    case(filePath.includes('/alerts/')): // validate using alert schema
      errors = validateAgainstSchema(file.contents[0], alertSchema);
      break;
    case(filePath.includes('/dashboards/')): // validate using dashboard schema
      errors = validateAgainstSchema(file.contents[0], dashboardSchema);
      break;
    case(filePath.includes('/instrumentation/synthetics/')): // validate using synthetics schema
      errors = validateAgainstSchema(file.contents[0], syntheticSchema);
      break;
    case(filePath.includes('/instrumentation/flex/')): // validate using flex config schema. 
      // The flex YAML is two documents, validate each of them
      errors = [ 
        ...validateAgainstSchema(file.contents[0], flexConfigSchema), 
        ...validateAgainstSchema(file.contents[1], flexIntegrationsSchema)
      ];
      break;
    default: // use main config schema
      errors = validateAgainstSchema(file.contents[0], mainConfigSchema);
      break;
  }

  return { ...file, errors };
}

/** 
 * Globs YAML and JSON files to be validated
 * @param {String} basePath - the base path to search under, usually the current working directory
 * @returns {String[]} An array containing the file paths
*/
const getPackFilePaths = (basePath) => {
  const options = {
    ignore: EXCLUDED_DIRECTORY_PATTERNS.map(d => path.resolve(basePath, d)) 
  };

  const yamlFilePaths = [
    ...glob.sync(path.resolve(basePath, '**/*.yaml'), options), 
    ...glob.sync(path.resolve(basePath, '**/*.yml'), options)
  ];

  const jsonFilePaths = glob.sync(path.resolve(basePath, '**/*.json'), options);

  return [ ...yamlFilePaths, ...jsonFilePaths ];
}

const main = () => {
  const filePaths = getPackFilePaths(process.cwd()).sort();
  const files = filePaths.map(readPackFile);

  const filesWithErrors = files.map(validateFile).filter(file => file.errors.length > 0);

  for (const f of filesWithErrors) {
    console.log(`\nError: ${removeCWDPrefix(f.path)}`);
    for (const e of f.errors) {
      console.log(`\t ${e.message}`);
    }
  }
  console.log('');

  if (filesWithErrors.length > 0) {
    process.exit(1);
  }
}

main();

