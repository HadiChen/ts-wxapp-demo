const { createFilter } = require('rollup-pluginutils')
const path = require('path')

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
      if (!filter(id) || path.extname(id) !== '.json') return null
      extracted.set(id, source || JSON.stringify({}))

      return {
        code: 'export default undefined;',
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
      const fileName = `${path.basename(file, path.extname(file))}.json`
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
