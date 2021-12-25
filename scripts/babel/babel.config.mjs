import path from 'path'

export const config = () => {
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript'
    ],

    plugins: [
            [
        '@babel/plugin-transform-runtime',
        {
          corejs: 3
        }
      ],

      [
        'babel-plugin-module-resolver',
        {
          root: [path.resolve('.')],

          alias: {
            ':private': './src/private'
          }
        }
      ]
    ]
  }
}

export default () => {
  return config()
}
