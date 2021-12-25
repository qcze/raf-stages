import path from 'path'
import rollup from 'rollup'
import rollup_babel from '@rollup/plugin-babel'
import rollup_resolve from '@rollup/plugin-node-resolve'
import { terser as rollup_terser } from 'rollup-plugin-terser'

export default rollup.defineConfig({
  input: {
    index: path.resolve('./src/exports/index.ts')
  },

  external: [
    /@babel\/runtime-corejs3/
  ],

  plugins: [
    rollup_babel({
      exclude: /node_modules/,
      babelHelpers: 'runtime',
      configFile: path.resolve('./scripts/babel/babel.config.mjs'),

      extensions: [
        '.js',
        '.mjs',
        '.cjs',

        '.ts'
      ]
    }),

    rollup_resolve({
      extensions: [
        '.js',
        '.mjs',
        '.cjs',

        '.ts'
      ]
    })
  ],

  output: [
    {
      format: 'commonjs',
      chunkFileNames: '[hash].cjs',
      entryFileNames: '[name].cjs',
      dir: path.resolve('./build/bundle/commonjs'),

      plugins: [
        rollup_terser()
      ]
    },
    {
      format: 'module',
      chunkFileNames: '[hash].mjs',
      entryFileNames: '[name].mjs',
      dir: path.resolve('./build/bundle/esmodule'),

      plugins: [
        rollup_terser()
      ]
    }
  ]
})
