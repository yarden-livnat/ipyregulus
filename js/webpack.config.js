const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

const dist_path = path.resolve(__dirname, 'lib');


module.exports =  {
  entry:'./src/plugin.ts',
  output: {
    filename: 'labext.js',
    path: dist_path,
    libraryTarget: 'amd'
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ },
      { test: /\.js$/, loader: "source-map-loader" },
      { test: /\.css$/,  use: [ 'style-loader', 'css-loader' ] },
      { test: /\.html$/, use: {loader: 'raw-loader' }},
      { test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ] }

    ]
  },

  plugins: [
    new CopyPlugin([
      {from: 'src/**/*.{html,css}', transformPath(target, abs) {
          return target.substring(4);
          }
      }
      ])
  ],
  resolve: {
    extensions: ['.ts', '.js', '.css', '.scss', '.html']
  },

  externals: [
   '@jupyter-widgets/base',
    'jupyter-scales', 'jupyter-datawidgets', 'jupyter-dataserializers'
  ]
};
