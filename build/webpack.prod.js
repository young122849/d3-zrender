const cleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')
const extractTextWebpackPlugin = require('extract-text-webpack-plugin')


module.exports = {
  mode: 'production',
  optimization: {
    namedModules: true
  },
  plugins: [
    new extractTextWebpackPlugin('assets/style/[name].css'),
    new cleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..')
    }),
  ]
}