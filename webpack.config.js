// var path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
// module.exports = {
  entry: './src/client/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },

  mode: 'development',

  module: {
    // loaders: [{
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      // query:{
      //   presets: ["es2015", "react", "stage-0"]
      // }
      options: {
        presets: ["@babel/preset-env", "@babel/preset-react"]
      }
    }]
  }
};