'use strict'

const publicPath = 'http://localhost:3001/'

module.exports = {
  devtool: 'source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:3001',
    './modules/client'
  ],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js',
    publicPath: publicPath
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }]
  },
  devServer: {
    contentBase: 'http://localhost:3001',
    publicPath: publicPath,
    port: 3001,
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
}
