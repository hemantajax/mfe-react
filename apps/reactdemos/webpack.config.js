const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { join } = require('path');

// Load Module Federation config
const mfConfig = require('./module-federation.config');

// Get Nx configuration (similar to Angular's build configurations)
const isProduction =
  process.env['NX_TASK_TARGET_CONFIGURATION'] === 'production';

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    publicPath: isProduction
      ? 'https://hemantajax.github.io/mfe-react/'
      : 'auto',
    uniqueName: 'reactdemos',
  },
  devServer: {
    port: 4201,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: isProduction ? '/mfe-react/' : '/',
      assets: ['./src/favicon.ico', './src/assets', './src/.nojekyll'],
      styles: ['./src/styles.scss'],
      outputHashing: isProduction ? 'all' : 'none',
      optimization: isProduction,
      stylePreprocessorOptions: {
        includePaths: [],
        sassOptions: {
          quietDeps: true,
          silenceDeprecations: ['import'],
        },
      },
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    new ModuleFederationPlugin({
      name: mfConfig.name,
      filename: 'remoteEntry.mjs',
      exposes: mfConfig.exposes,
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
      },
    }),
  ],
};
