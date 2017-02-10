/* tslint:disable */

/**
 * here we name all of the pages
 * resolve them to the root directory
 *
 * loop through them to
 * 1) map the names -> entry point names -> output names
 * 2) map the names to resolved aliases for each package
 *
 * add our babel-query
 * - which does not work yet because vnodes issue?
 *
 * this approach currently means we have to build ts -> js first
 * so that we can alias the require statements when doing the building
 *
 *
 * @NOTE:
 * @TODO:
 * there is one major difference between this (currently) and rollup
 * each built dist file will not contain `require` statements
 * to the other packages, they will be built into the dist
 *
 */

const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const resolve = (relativePath) => path.join(__dirname, '../', relativePath);

const names = [
	'inferno',
	'inferno-compat',
	'inferno-component',
	'inferno-create-class',
	'inferno-create-element',
	'inferno-shared',
	'inferno-hyperscript',
	'inferno-mobx',
	'inferno-redux',
	'inferno-router',
	'inferno-server',
	// 'inferno-vnode-flags',
];
const packages = {};
const alias = {};
names.forEach((name) => {
	const resolvedName = './packages/' + name;
	const input = resolvedName + '/dist-es/';
	const output = name + '/dist/';
	alias[name] = input;
	packages[output] = input;
});
const query = {
	compact: false,
	babelrc: false,
	cacheDirectory: true,
	presets: [
    [ 'es2015', { loose: true }],
		'stage-2'
	],
	plugins: [
		'babel-plugin-transform-object-assign',
		'babel-plugin-transform-undefined-to-void',
		'babel-plugin-transform-class-properties',
		'babel-plugin-transform-object-rest-spread',
		'babel-plugin-syntax-jsx',
		[ 'module-resolver',
			{
				extensions: ['.js'],
				alias: alias,
			},
		],

		// @NOTE: using this triggers errors of vnode not found
		// [ 'babel-plugin-inferno', { imports: true }],
	]
};

module.exports = {
	entry: packages,
	// devtool: '#source-map',
	output: {
		path: resolve('./packages/'),
		filename: '[name]index.js', // [file].js
		// sourceMapFilename: '[file].map',
	},
	performance: {
		hints: false
	},
	module: {
		loaders: [
			{
				test: /\.js?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: query,
			},

			// @TODO:
			// - [ ] load with ts, then build
			//
			// ts loader, is not used
			// {
			// 	test: /\.tsx?$/,
			// 	loader: 'ts-loader',
			// 	options: {
			// 		transpileOnly: true,
			// 	},
			// },
		],
	},
	resolve: {
		alias,
		extensions: [ '.js', '.jsx' ],
		mainFields: [ 'browser', 'module', 'main' ],
	},
	plugins: [
		// By default, webpack does `n=>n` compilation with entry files. This concatenates
		// them into a single chunk.
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		}),
	]
};
