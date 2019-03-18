import salad from './postcss-salad/index.js'
const { createFilter } = require('rollup-pluginutils')
const postcss = require('postcss')
const postcssMpvueWxss = require('postcss-mpvue-wxss')
const postcssFlexible = require('postcss-flexible')
const path = require('path')
import postcssProd from './postcss-prod/index.js'
const isPro = process.env.NODE_ENV === 'production'

export default function filePlugin (options = {}) {
  const filter = createFilter(options.include, options.exclude)
  const extracted = new Map()

  var postcssPlugins = [
    postcssFlexible({
      remUnit: 75
    }),
    postcssMpvueWxss({
      cleanSelector: ['*'],
      remToRpx: 100,
      replaceTagSelector: Object.assign(require('postcss-mpvue-wxss/lib/wxmlTagMap'), {
        // 将覆盖前面的 * 选择器被清理规则
        '*': 'view, text'
      })
    }),
    salad({
      browsers: ['last 3 versions'],
      features: {
        autoprefixer: false,
        bem: {
          shortcuts: {
            'component': 'b',
            'modifier': 'm',
            'descendent': 'e',
            'utility': 'util',
            'component-namespace': 'n'
          },
          separators: {
            descendent: '__',
            modifier: '--'
          }
        }
      }
    })
  ]

  if (isPro) {
    postcssPlugins.push(
     ...postcssProd
    )
  }

  return {
    // 插件名
    name: 'wxmlFilePlugin',
    /**
     * 文件转译
     * @param {string} source 文件代码
     * @param {string} id 文件路径
     */
    async transform (source, id) {
      if (!filter(id) || path.extname(id) !== '.wxss') return null
      extracted.set(id, source)

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
      const fileName = `${path.basename(file, path.extname(file))}.wxss`
      const code = extracted.get(file.replace('.dist', 'src'))

      if (!code) return

      return postcss(postcssPlugins)
        .process(code, {
          // 不需要源映射
          map: false
        })
        .then(result => {
          const codeFile = {
            fileName: fileName,
            isAsset: true,
            source: result.css
          }

          bundle[codeFile.fileName] = codeFile
        })
    }
  }
}
