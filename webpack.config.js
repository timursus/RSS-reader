const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const devMode = (process.env.NODE_ENV !== 'production');

const getFilename = (ext) => (devMode ? `[name].${ext}` : `[name].[contenthash].${ext}`);

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    filename: getFilename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 4200,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './assets/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: getFilename('css'),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'assets/favicon.png'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
};
