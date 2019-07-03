const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './dist/cli/main.cli.js',
  output: {
    path: path.resolve(__dirname, 'dist/cli'),
    filename: 'bundle.cli.js'
  }
};