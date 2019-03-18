var fse = require('fs-extra')
const consola = require('consola')

export default function copy (options) {
  return {
    name: 'copy',
    generateBundle () {
      for (let key in options) {
        const src = key
        const dest = options[key]

        fse.copy(src, dest)
          .then(() => {
            consola.success(`(copy) ${src} -> ${dest}`)
          })
          .catch( (err) => {
            consola.error(err)
          })
      }
    }
  }
}
