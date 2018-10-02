const webpack = require('webpack')

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
  },
  plugins: [
    new webpack.ProvidePlugin({
      'd3': 'd3'
    })
  ]
}