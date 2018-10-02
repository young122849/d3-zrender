module.exports = {
  plugins: {
    'postcss-preset-env': {
      browsers: 'last 2 versions',
      features: {
        'nesting-rules': true,
        'custom-media-queries': true
      }
    },
    'cssnano': {}, // 压缩CSS代码
  }
}