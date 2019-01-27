// import global vars for a whole app
require('./global');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const debug = require('debug')('app:webpack:config');
const CleanPlugin = require('clean-webpack-plugin'); // webpack插件，用于清除目录文件
const CopyWebpackPlugin = require('copy-webpack-plugin');
// ------------------------------------
// RULES INJECTION!

// ------------------------------------
const rules = [
  {
    enforce: "pre",
    test: /\.(js|jsx)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'eslint-loader',
    options: {
      quiet: true // 忽略警告，只显示错误
    }
  },
  {
    enforce: "pre",
    test: /\.(ts|tsx)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'tslint-loader',
    options: {
      quiet: true,
      tsConfigFile: './tsconfig.json'
    }
  },
  {
    test: /\.html$/,
    use: {
      loader: 'html-loader'
    }
  },
  {
    test: /\.(js|jsx|ts|tsx)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'babel-loader'
  },
  {
    test: /\.json$/,
    loader: 'json-loader'
  },
  // STYLE
  {
    test: /\.scss$/,
    use: [
      __PROD__ ? MiniCssExtractPlugin.loader : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      'postcss-loader',
      'sass-loader'
    ]
  },
  {
    test: /\.less$/,
    use: [
      __PROD__ ? MiniCssExtractPlugin.loader : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        }
      },
      'postcss-loader',
      'less-loader'
    ]
  },
  {
    test: /\.(png|jpg|jpeg|gif|svg)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 20000,
          name: 'image/[name]-[hash:8].[ext]'
        }
      }
    ]
  },
  {
    test: /\.(woff2|eot|ttf|otf)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: 'fonts/[name]-[hash:7].[ext]'
        }
      }
    ]
  }
];

// ------------------------------------
// BUNDLES OPTIMIZATION
// ------------------------------------
const optimization = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 2
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            unused: true,
            dead_code: true,
            warnings: false
          }
        },
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  performance: {
    hints: false
  }
};

// ------------------------------------
// STAGE PLUGINS INJECTION! [DEVELOPMENT, PRODUCTION, TESTING]
// ------------------------------------
const stagePlugins = {
  test: [new BundleAnalyzerPlugin()],
  development: [
    new HtmlWebpackPlugin({
      template: path.resolve('./src/index.html'),
      filename: 'index.html',
      inject: 'body',
      minify: false,
      chunksSortMode: 'auto'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  production: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[hash].css'
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, '/src/assets'), to: path.join(__dirname, '/dist/assets') },
      { from: path.join(__dirname, '/src/static'), to: path.join(__dirname, '/dist/static') }
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve('./src/index.html'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true
      },
      chunksSortMode: 'auto'
    }),
    new CleanPlugin(['dist'], { // 清除dist
      root: path.join(__dirname, './')
    })
  ]
};

// ------------------------------------
// STAGE CONFIGURATION INJECTION! [DEVELOPMENT, PRODUCTION]
// ------------------------------------
const stageConfig = {
  development: {
    devtool: '',
    stats: {
      chunks: false,
      children: false,
      chunkModules: false,
      colors: true
    }
  },
  production: {
    devtool: 'source-map'
  }
};

const createConfig = () => {
  debug('Creating configuration.');
  debug(`Enabling devtools for '${__NODE_ENV__} Mode!'`);

  const webpackConfig = {
    mode: __DEV__ ? 'development' : 'production',
    name: 'client',
    target: 'web', 
    devtool: stageConfig[__NODE_ENV__].devtool,
    stats: stageConfig[__NODE_ENV__].stats,
    module: {
      rules: [...rules]
    },
    ...optimization,
    resolve: {
      modules: ['node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    }
  };

  // ------------------------------------
  // Entry Points
  // ------------------------------------
  webpackConfig.entry = {
    app: ['babel-polyfill', path.resolve(__dirname, 'src/index.js')].concat(
      'webpack-hot-middleware/client?path=/__webpack_hmr'
    )
  };

  webpackConfig.output = {
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  };

  // ------------------------------------
  // Plugins
  // ------------------------------------
  debug(`Enable plugins for '${__NODE_ENV__} Mode!'`);
  webpackConfig.plugins = [
    new webpack.DefinePlugin({
      __DEV__,
      __PROD__,
      __TEST__
    }),
    ...stagePlugins[__NODE_ENV__]
  ];

  // ------------------------------------
  // Finishing the Webpack configuration!
  // ------------------------------------
  debug(`Webpack Bundles is Ready for '${__NODE_ENV__} Mode!'`);
  return webpackConfig;
};

module.exports = createConfig();
