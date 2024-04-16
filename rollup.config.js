// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  // other configurations...
  plugins: [
    commonjs({
      ignoreDynamicRequires: true
    }),
    copy({
      targets: [
        { src: 'src/data/countries/*.json', dest: 'dist/data/countries' }
      ]
    })
  ]
};
