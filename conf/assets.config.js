const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack = require('webpack');

module.exports = {
  mode: 'production',
  devtool: 'inline-source-map',
  plugins: [
    new MiniCssExtractPlugin(),
    new Webpack.SourceMapDevToolPlugin(),
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-react"]
        }
      }, 'source-map-loader']
    }, {
      test: /\.css$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }, {
      test: /\.(png|jpe?g|gif|woff|woff2|ttf)$/i,
      use: ['file-loader']
    }],
  },
  node: {
    fs: 'empty',
  },
  externals: {
    electron: 'Electron',
  },
};
