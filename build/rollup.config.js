// import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript'
import tscompile from 'typescript'
import alias from 'rollup-plugin-alias'
import wxmlFilePlugin from './plugin/wxml-file-plugin'
import jsonFilePlugin from './plugin/json-file-plugin'
import wxssFilePlugin from './plugin/wxss-file-plugin'
// import salad from './plugin/postcss-salad/index.js'

const path = require('path')
// const isDev = process.env.NODE_ENV === 'development'

export default {
  plugins: [
    alias({
      resolve: ['.js', '.ts'],
      '@': path.resolve(__dirname, '../src')
    }),
    wxmlFilePlugin(),
    jsonFilePlugin(),
    wxssFilePlugin(),
    typescript(
      {
        typescript: tscompile
      }
    )
  ]
}
