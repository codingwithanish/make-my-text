import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/js/extension/extract-content.js',
    output: {
      dir: 'dist/js',
      format: 'es'
    },
    plugins: [
      commonjs(),
      nodeResolve(),
    ]
  }
];