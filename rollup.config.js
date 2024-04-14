import commonjs from '@rollup/plugin-commonjs';

export default {
  // Other Rollup config options...
  plugins: [
    commonjs({
      dynamicRequireTargets: [
        'src/data/countries/*.json',
      ]
    })
  ]
};
