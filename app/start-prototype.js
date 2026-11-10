const path = require('path');

// MOJ Frontend imports GOV.UK Frontend from node_modules using Sass load paths.
const nodeModules = path.resolve(__dirname, '..', 'node_modules');
process.env.SASS_PATH = [nodeModules, process.env.SASS_PATH].filter(Boolean).join(path.delimiter);

require('govuk-prototype-kit/bin/cli');
