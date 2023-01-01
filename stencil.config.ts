import { Config } from '@stencil/core';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export const config: Config = {
  namespace: 'my-component',
  globalStyle: './src/ldexplorer/index.css',
  srcDir: './src/ldexplorer',
  commonjs: {
    namedExports: {
      './src/lib/libCava': ['LibCava'],
      './src/scripts/query-helper': ['query-helper']
    }
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    // { 
    //   type: 'dist-hydrate-script'
    // },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      baseUrl: 'http://localhost:8080',
    },
  ],
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ]
  },
  extras: {
    cloneNodeFix: true
  }
};
