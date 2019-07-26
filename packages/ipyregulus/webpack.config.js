const path = require('path');
const nodeExternals = require('webpack-node-externals');

const dist_path = path.resolve(__dirname, 'lib')


var rules = [
  { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ },
  { test: /\.js$/, loader: "source-map-loader" },
  { test: /\.css$/,  use: [ 'style-loader', 'css-loader' ] },
  { test: /\.html$/, use: {loader: 'raw-loader' }},
  { test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ] }

];

const plugins = [];

const resolve = {
  extensions: ['.ts', '.js', '.css', '.scss', '.html']
  // modules:['src', 'node_modules']
};

externals = [
  '@jupyter-widgets/base',
  'jupyter-scales', 'jupyter-datawidgets', 'jupyter-dataserializers'
];

nb= {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: __dirname + '/../../ipyregulus/nbextension/static',
    libraryTarget: 'amd'
  },
  module: {
    rules: rules
  },
  devtool: 'source-map',
  externals: ['@jupyter-widgets/base', 'jupyter-scales', 'jupyter-datawidgets', 'jupyter-dataserializers'],
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js", '.css', '.html']
  }
};

const lab = {
  entry:'./src/plugin.ts',
  output: {
    filename: 'labext.js',
    path: dist_path,
    libraryTarget: 'amd'
  },
  mode: 'developmet',
  devtool: 'source-map',
  // node: {
  //    fs: 'empty',
  //  },
  module: {
    rules
  },
  plugins,
  resolve,
  externals
  // externals: [nodeExternals(
  //   whitelist=['/^d3/']
  // )]
}

module.exports = [
  lab
];
