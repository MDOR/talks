import path from 'path';
import webpack from 'webpack';

function config (env = 'development') {
  let configWebpack = {};
  const plugins = []

  if (env === 'production') {
    let webpackEnv, uglify;

    webpackEnv = new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('production')}
    });

    uglify = new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        drop_console: true,
        warnings: false
      }
    });

    plugins.push(webpackEnv, uglify);
  }

  configWebpack = {
    entry: {
      main: path.join(process.cwd(), '/app/js/main.js')
    },
    output: {
      path: path.join(process.cwd(), env === 'development' ? '/dist/js' : '/docs/js'),
      filename: '[name].js'
    },
    devtool: env === 'production' ? 'cheap-source-map' : 'source-map',
    plugins,
    module: {
      loaders: [{
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      }, {
        test: /\.scss/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }, {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      }]
    },
    resolve: {
      extensions: ['.js', '']
    },
    stats: {
      colors: true,
      modules: true,
      reasons: true,
      errorDetails: true
    }
  };

  return configWebpack;
}

export default config;
