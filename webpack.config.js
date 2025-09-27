const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    content: "./extension/content.js",
    background: "./extension/background.js",
    popup: "./extension/popup.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  optimization: {
    minimize: false, // Disable minification to prevent code removal
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "manifest.json",
          to: "manifest.json",
        },
        {
          from: "extension/popup.html",
          to: "popup.html",
        },
        {
          from: "extension/popup.css",
          to: "popup.css",
        },
        {
          from: "extension/content.css",
          to: "content.css",
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".json"],
  },
  devtool: "source-map",
};
