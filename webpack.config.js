const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "scripts.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devtool: false,
  devServer: {
    open: true,
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
          {
            loader: "file-loader",
            options: {
              name: "[name].css",
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
  ],
};
