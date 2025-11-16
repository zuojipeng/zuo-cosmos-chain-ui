const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 添加fallbacks for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process'),
      };

      // 添加plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      return webpackConfig;
    },
  },
};