const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require('webpack-node-externals');

const dist_path = path.resolve(__dirname, 'lib')

// const externals = ['@jupyter-widgets/base']

const plugins = [
  new MiniCssExtractPlugin({
        filename: 'style.css',
      }),
      // new CheckerPlugin()
]
const rules = [
  { test: /\.ts$/, use: 'ts-loader'},
  { test: /\.(scss)$/,
    use: ['style-loader', MiniCssExtractPlugin.loader,'css-loader',
          { loader: 'postcss-loader',
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [require('precss'), require('autoprefixer') ];
              }
            }
          },
          'sass-loader'
        ]
  },
  { test: /\.css$/,  use: [ 'style-loader', 'css-loader' ] },
  { test: /\.html$/, use: {loader: 'raw-loader' }},
  { test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ] }
]

const resolve = {
  extensions: ['.ts', '.js', '.css', '.scss', '.html'],
  modules:['src', 'node_modules']
}

const lab = {
  entry:'./src/plugin.ts',
  output: {
    filename: 'labext.js',
    path: dist_path,
    libraryTarget: 'amd'
  },
  mode: 'developmet',
  devtool: 'source-map',
  node: {
     fs: 'empty',
   },
  module: {
    rules
  },
  plugins,
  resolve,
  externals: [nodeExternals(
    whitelist=['/^d3/']
  )]
}


module.exports = [
  lab
]
