const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (_, argv) => ({
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "scripts.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devtool: false,
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
              modules: {
                localIdentName:
                  argv.mode === "production"
                    ? "[hash:base64]"
                    : "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  externals: {
    "pixi.js": "PIXI",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      inject: false,
    }),
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
  ],
});
