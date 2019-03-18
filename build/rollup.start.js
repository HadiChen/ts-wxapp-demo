import rollupBaseConfig from './rollup.config.js'
import copy from './plugin/copy.js'
const consola = require('consola')
const path = require('path')
const fs = require('fs')
const isArray = Array.isArray
const distPath = path.resolve(__dirname, '../.dist')
const isDev = process.env.NODE_ENV === 'development'

/**
 * src路径
 * @param {string} filePath 
 */
const src = filePath => {
  let _filePath = filePath

  if (_filePath.indexOf(_filePath) === 0) {
    _filePath = _filePath.substr(1)
  }
  return getFullPath(filePath, '../src')
}
/**
 * 获取完整文件地址
 * @param {string} dir 
 * @param {string} filePath 
 */
const getFullPath = (filePath = '', dir = '../') => path.resolve(__dirname, dir, filePath)

// 组件列表
const components = new Set()
// 检测文件类型
const fileType = ['ts', 'js', 'css', 'wxml', 'json', 'wxss']
// 文件配置列表
var configList = []

function setCopyFileParams () {
  if (configList.length) {
    let plugins = configList[configList.length - 1].plugins
  
    plugins.push(
      copy(copyfilesConfig([
        {
          inputFile: getFullPath('ext.json'),
          file: 'ext.json'
        },
        'assets',
        'lib',
        'static'
      ]))
    )
  }
}

/**
 * 针对ts的文件输出
 * @param {path: string} filePath 文件路径
 * @param {string} type 文件类型
 */
function outputFile(filePath, type) {
  switch (type) {
    case 'ts':
      return `${filePath}.js`
    default:
      return `${filePath}.${type}`
  }
}

/**
 * 处理组件配置列表
 * @param {string} dir 
 * @param {string} srcFilePath 
 */
function getCompLists(dir, srcFilePath) {
  const { usingComponents = {} } = require(srcFilePath)
  Object.keys(usingComponents).forEach(key => {
    let pathFile = path.resolve(path.dirname(dir), usingComponents[key])
    pathFile = pathFile.split('src/')[1]
    components.add(pathFile)
  })
}

/**
 * 配置rollup配置信息
 * @param {string} pathFile 
 */
function getConfigs (pathFile) {
  let list = []
  fileType.forEach(type => {
    const file = `${pathFile}.${type}`
    const srcFilePath = src(file)

    if (fs.existsSync(srcFilePath)) {
      // 文件配置
      let fileConfig = {
        input: srcFilePath,
        output: {
          strict: false,
          format: 'es',
          sourcemap: !isDev,
          // 输出文件
          file: path.join(distPath, outputFile(pathFile, type))
        },
        ...rollupBaseConfig
      }
      list.push(fileConfig)

      if (type === 'json') {
        getCompLists(src(pathFile), srcFilePath)
      }
    }
  })
  /**
   * 复制文件
   */
  // if (list.length) {
  //   let plugins = list[list.length - 1].plugins

  //   plugins.push(
  //     copy(copyfilesConfig(pathFile))
  //   )
  // }
  return list
}

/**
 * 复制文件配置
 * @param {string | Array} pathFiles 文件路径
 */
function copyfilesConfig (pathFiles) {
  let copyObj = {}
  let _pathFiles = Array.isArray(pathFiles) ? pathFiles : [pathFiles]

  const copyFn = (srcFilePath, filePath, hasOutputFile) => {
    if (fs.existsSync(srcFilePath)) {
      copyObj[srcFilePath] = hasOutputFile ? filePath : path.resolve(distPath, filePath)
    }
  }

  _pathFiles.forEach(pathFileItem => {
    //假如为字符串就默认为: file
    let opts = typeof pathFileItem === 'object' ? pathFileItem : {
      file: pathFileItem
    }

    let hasOutputFile = !!opts.outputFile
    copyFn(
      opts.inputFile
        ? opts.inputFile
        : src(opts.file),
      hasOutputFile 
        ? opts.outputFile
        : opts.file,
      hasOutputFile
    )
  })
  
  return copyObj
}

function entry() {
  const mainPath = src('app.json')
  if (!fs.existsSync(mainPath)) {
    throw new Error(`没有找到入口文件: ${mainPath}`)
  }
  consola.info('获取文件配置列表')

  let main = require(mainPath)
  // 主包入口,加上app入口
  let mainPackages = isArray(main.pages) ? main.pages : []
  mainPackages.unshift('app')
  // 分包入口
  let subPackages = isArray(main.subpackages) ? main.subpackages : []
  let mainPackagesConfig = []
  let subPackagesConfig = []
  let compPackagesConfig = []

  mainPackages.forEach(pageFile => {
    mainPackagesConfig.push(
      ...getConfigs(pageFile)
    )    
  })

  subPackages.forEach(item => {
    if (fs.existsSync(src(item.root)) && isArray(item.pages)) {
      item.pages.forEach(pageFile => {
        subPackagesConfig.push(
          ...getConfigs(path.join(item.root, pageFile))
        )
      })
    }
  })

  Array.from(components).forEach(filePath => {
    compPackagesConfig.push(
      ...getConfigs(filePath)
    )
  })

  configList = configList.concat(
    mainPackagesConfig,
    subPackagesConfig,
    compPackagesConfig
  )
  setCopyFileParams()

  return configList
}

export default entry()
