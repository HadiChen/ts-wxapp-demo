import postcss from 'postcss'
import { isSupported } from 'caniuse-api'

import libraryFeatures from './features'
import featuresActivationMap from './features-activation-map'
import warnForDuplicates from './warn-for-duplicates'

const plugin = postcss.plugin('postcss-salad', (options) => {
  options = {
    console: console,
    warnForDuplicates: true,
    features: {},
    ...options,
  }

  const features = options.features

  // 将浏览器选项复制到支持它的插件
  const pluginsToPropagateBrowserOption = [ 'autoprefixer', 'rem' ]

  pluginsToPropagateBrowserOption.forEach((name) => {
    const feature = features[name]

    if (feature !== false) {
      features[name] = {
        browsers: (
          feature && feature.browsers
          ? feature.browsers
          : options.browsers
        ),
        ...(feature || {}),
      }
    }
  })

  if (features.autoprefixer && features.autoprefixer.browsers === undefined) {
    delete features.autoprefixer.browsers
  }

  const processor = postcss()

  // 特性(features)
  Object.keys(libraryFeatures).forEach(key => {
    // 特性自动启用：条件 -- 👇
    // not disable && (enabled || no data yet || !supported yet)
    if (
      // 特性没禁止
      features[key] !== false &&
      (
        // 特性启动
        features[key] === true ||

        // 在浏览器中特性暂时没有任何数据
        featuresActivationMap[key] === undefined ||

        // 在浏览器中特性暂时不支持
        (
          featuresActivationMap[key] &&
          featuresActivationMap[key][0] &&
          !isSupported(featuresActivationMap[key][0], options.browsers)
        )
      )
    ) {
      const plugin = libraryFeatures[key](
        typeof features[key] === 'object'
          ? { ...features[key] }
          : undefined
        )
      processor.use(plugin)
    }
  })

  if (options.warnForDuplicates) {
    processor.use(warnForDuplicates({
      keys: Object.keys(libraryFeatures),
      console: options.console,
    }))
  }

  return processor
})

plugin.features = libraryFeatures

export default plugin
