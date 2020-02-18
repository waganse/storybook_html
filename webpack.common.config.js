const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')

// Entry points
let entries = {};

glob.sync("./src/js/**/[^_]*.js").map(function (file) {
  return entries[file.match(/src(\/js\/|\/)([a-zA-Z0-9_\/]*\/?[a-zA-Z0-9_]+)\.js/i)[2]] = [file];
});

const webpackConfig = {
  entry: entries,
  output: {
    filename: 'js/[name]-bundle.js',
    path: path.resolve(__dirname, '.dist'),
    publicPath: '/'
  },
  resolve: {
    alias: {
      '@JS': path.resolve(__dirname, 'src/js'),
      '@SCSS': path.resolve(__dirname, 'src/scss'),
    },
    extensions: ['*', '.js', '.vue', '.json', 'scss']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          },
          {
            loader: 'eslint-loader',
            options: {
              configFile: '.eslintrc',
              enforce: 'pre',
            }
          }
        ]
      },
      {
        test: /\.ect$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              // minimize: true
            }
          },
          {
            loader: 'webpack-ect-loader',
            options: {
              root: path.resolve(__dirname, 'src/ect'),
              gzip: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/'
            }
          },
          // { loader: 'vue-style-loader' },
          { loader: 'css-loader' },
          { loader: 'group-css-media-queries-loader' },
          { loader: 'postcss-loader' },
          {
            loader: 'clean-css-loader',
            options: {
              level: 2
            }
          },
          {
            loader: 'sass-loader',
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 102400,
              outputPath: 'img/'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              pngquant: {
                quality: '80'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlReplaceWebpackPlugin([
      {
        pattern: /(<!--\s*|@@)(css|js):([\w-\/]+)(\s*-->)?/g,
        replacement: function(match, $1, type, file, $4, index, input) {
          const tpl = {
            css: '<link rel="stylesheet" href="/css/%s">',
            js: '<script src="/js/%s"></script>'
          };

          // const url = file + '-bundle-' + hash + '.' + type;
          const url = file + '-bundle.' + type;

          // $1==='@@' <--EQ--> $4===undefined
          return $4 == undefined ? url : tpl[type].replace('%s', url)
        }
      }
    ]),
    new MiniCssExtractPlugin({
      // filename: 'css/[name]-bundle-' + hash + '.css',
      filename: 'css/[name]-bundle.css',
      publicPath: '/'
    }),
    new StyleLintPlugin({
      configFile: '.stylelintrc'
    }),
  ]
};

// Multiple ect entries
glob.sync("./src/ect/**/[^_]*.ect").map(function(file) {
  let filename = file.match(/src(\/ect\/|\/)([a-zA-Z0-9_\/]*\/?[a-zA-Z0-9_]+)\.ect/i)[2];

  webpackConfig.plugins.unshift(
    new HTMLWebpackPlugin({
      filename: filename + '.html',
      template: file,
      publicPath: '/',
      inject: false
    })
  );
});

module.exports = webpackConfig;
