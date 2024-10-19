const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
var webpack = require("webpack");

function getBlob() {
    return {foo: 'My Title'};
}

module.exports = {
  mode: 'development',
  optimization: {
    usedExports: true,
  },
  devtool: 'inline-source-map',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
//    filename: 'bundle.js',
    filename: '[name].[hash].js',
    library: 'MyLibrary',
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'webpack Boilerplate',
        template: path.resolve(__dirname, './src/template.html'), // template file
        filename: 'index.html', // output file
        scriptLoading: 'blocking',
        inject: 'head',
    }),
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
        $: require.resolve('jquery'),
        jQuery: require.resolve('jquery')
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'], // , '.mustache'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      }, {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
}
