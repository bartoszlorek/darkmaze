const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const autoprefixer = require("autoprefixer");
const easingGradients = require("postcss-easing-gradients");

module.exports = (_, argv) => ({
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "scripts.js",
    path: path.join(__dirname, "dist"),
    clean: true,
  },
  devtool: false,
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "public"),
      },
      {
        directory: path.join(__dirname, "src/assets"),
        publicPath: "/assets",
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
              modules: {
                localIdentName:
                  argv.mode === "production"
                    ? "[hash:base64]"
                    : "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer({
                    cascade: false,
                  }),
                  easingGradients,
                ],
              },
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.frag$/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  externals: {
    "pixi.js": "PIXI",
    "pixi-projection": "PIXI.projection",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public" },
        { from: "src/assets/*.png", to: "assets/[name][ext]" },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(process.env.npm_package_version),
    }),
  ],
  performance: {
    hints: false,
  },
});
