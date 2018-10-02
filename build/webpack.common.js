const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const productionConfig = require('./webpack.prod')
const developmentConfig = require('./webpack.dev')
const extractTextWebpackPlugin = require('extract-text-webpack-plugin')
const htmlWebpackPlugin = require('html-webpack-plugin')
const inlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')
const generatedConfig = (env) => {

  const scriptLoader = [{
    loader: 'babel-loader'
  }].concat(env === 'production' ? [] : [])

  const cssLoaders = [{
    loader: 'css-loader',
  },
  {
    loader: 'postcss-loader'
  },
  {
    loader: 'sass-loader'
  }]
  const styleLoader = env === 'production'
    ? extractTextWebpackPlugin.extract({
      fallback: 'style-loader',
      use: cssLoaders
    })
    : [{ loader: 'style-loader' }].concat(cssLoaders)


  return {
    entry: path.resolve(__dirname, '..', 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: 'assets/script/[name].[chunkhash:5].js',
      publicPath: '/'
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest'
      },
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: true
      }
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: styleLoader
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1000,
                fallback: 'file-loader',
                name: '[name].[hash:5].[ext]',
                outputPath: 'assets/images/',
              }
            }
          ]
        },
        {
          test: /\.svg/,
          include: path.resolve(__dirname, '..', 'src/assets/icons'),
          use: [{
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]'
            }
          }]
        },
        {
          test: /\.html$/,
          use: [{
            loader: 'html-loader', options: {
              attrs: ['img:src', 'img:data-src']
            }
          }]
        }
      ]
    },
    plugins: [
      new htmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '..', 'index.html'),
        minify: {
          collapseWhitespace: true
        }
      }),
      new inlineManifestWebpackPlugin('manifest'),
      new copyWebpackPlugin([{ from: path.resolve(__dirname, '..', 'static'), to: './static' }])
    ]
  }
}

module.exports = env => {
  let config = env === 'production' ? productionConfig : developmentConfig
  return merge(generatedConfig(env), config)
}