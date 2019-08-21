const path = require('path');
const paths = {
    src: path.resolve(__dirname, 'templates'),
    dist: path.resolve(__dirname, 'static/js')
};

const TSLintPlugin = require('tslint-webpack-plugin');

module.exports = {
  mode: 'production',
  context: paths.src,
  entry: {
    app: ['./tsx/Home.tsx','./tsx/Header.tsx','./tsx/Admin.tsx','./tsx/Transactions.tsx','./tsx/Login.tsx','./tsx/Constants.tsx']
  },
  output: {
    filename: 'bundle.js',
    path: paths.dist
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':data-src']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|png|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './static/js/font/[hash].[ext]',
            },
          },
        ]
      }
    ]
  },
  plugins: [
       new TSLintPlugin({
            files: ['./templates/tsx/*.tsx']
        })
    ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
  },
};
