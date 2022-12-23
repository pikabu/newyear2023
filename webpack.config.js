const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: './src/index.ts',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.hbs$/,
				exclude: /node_modules/,
				loader: 'handlebars-loader'
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							sassOptions: {
								outputStyle: "compressed",
							},
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.hbs', '.ts', '.js'],
		alias: {
			game: path.resolve(__dirname, 'src/')
		},
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
		//path: 'c:\\Projects\\pikabu\\backend\\page\\newyear2023',
		assetModuleFilename: "assets/[name][ext]",
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 9766,
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'style.css'
		}),
		new CopyPlugin({
			patterns: [
				{from: 'public', to: ''}
			],
		}),
	],
	devtool: 'source-map',
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	}
};