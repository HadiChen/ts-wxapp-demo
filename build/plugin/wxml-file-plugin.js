const { createFilter } = require('rollup-pluginutils')
const path = require('path')
import { minify } from 'html-minifier'
import MagicString from 'magic-string'

const isPro = process.env.NODE_ENV === 'production'

const aliasRegList = [
  {
    reg: /src=[\'\"]?[@]([^\'\"]*)[\'\"]?/i,
    key: 'src'
  },
  {
    reg: /path=[\'\"]?[@]([^\'\"]*)[\'\"]?/i,
    key: 'path'
  }
]
// 默认压缩配置信息
const defaultMiniOpts = {
  processConditionalComments: true,
  // 删除注释代码
  removeComments: true,
  // 通过minifier处理条件注释的内容
  processConditionalComments: true,
  // 忽略某些片段的代码
  ignoreCustomFragments: [/<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/, /{{(.*?)}}/ /** 不处理双花括号内容 */],
  /**
   * 使用css压缩
   * @see https://github.com/jakubpawlowicz/clean-css
   */
  minifyCSS: true,
  // css压缩opts
  units: {
    // 控制`rpx`作为支持的单位
    rpx: true
  }
}

export default function filePlugin (options = {}) {
  const filter = createFilter(options.include, options.exclude)
  const extracted = new Map()

  return {
    // 插件名
    name: 'wxmlFilePlugin',
    /**
     * 文件转译
     * @param {string} source 文件代码
     * @param {string} id 文件路径
     */
    async transform (source, id) {
      if (!filter(id) || path.extname(id) !== '.wxml') return null
      var magicString = new MagicString(source)
      const directory = path.posix.dirname(id)
      const dir = path.resolve(__dirname, '../src')

      var match
      var start
      var end

      /**
       * 别名替换
       * 支持src/path
       */
      aliasRegList.forEach(aliasReg => {
        while ((match = aliasReg.reg.exec(magicString.toString()))) {
          const filePath = path.join(dir, match[1])
          const fileRelative = path.posix.relative(directory, filePath)
          start = match.index
          end = start + match[0].length
          let replacement = `${aliasReg.key}="${fileRelative}"`
          
          magicString.overwrite(start, end, replacement)
          magicString = new MagicString(magicString.toString())
        }
      })

      /**
       * 压缩html代码
       * @see https://github.com/kangax/html-minifier
       */
      var code = ''

      if (isPro) {
        code = minify(magicString.toString(), Object.assign({}, options, defaultMiniOpts))
      } else {
        code = magicString.toString()
      }

      extracted.set(id, code)
      return {
        code: '',
        map: {
          mappings: ''
        }
      }
    },
    /**
     * 生成可执行文件
     * @param {Object} opts 文件信息
     * @param {Object} bundle 可执行文件
     */
    async generateBundle (opts, bundle) {
      if (extracted.size === 0) return

      const file =
        opts.file ||
        path.join(
          opts.dir,
          Object.keys(bundle).find(fileName => bundle[fileName].isEntry)
        )
      const fileName = `${path.basename(file, path.extname(file))}.wxml`
      const code = extracted.get(file.replace('.dist', 'src'))

      if (!code) return
      const codeFile = {
        fileName: fileName,
        isAsset: true,
        source: code
      }

      bundle[codeFile.fileName] = codeFile
    }
  }
}
