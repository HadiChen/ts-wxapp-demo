const postcssExtend = require('postcss-extend')
import colormin  from 'postcss-colormin'
import discardEmpty  from 'postcss-discard-empty'
import mergeIdents  from 'postcss-merge-idents'
import minifyFontValues  from 'postcss-minify-font-values'
import minifyGradients  from 'postcss-minify-gradients'
import minifyParams  from 'postcss-minify-params'
import minifySelectors  from 'postcss-minify-selectors'
import discardUnused from 'postcss-discard-unused'
import normalizeWhitespace from 'postcss-normalize-whitespace'
import discardDuplicates from 'postcss-discard-duplicates'

export default [
  postcssExtend(),
  colormin(),
  discardEmpty(),
  mergeIdents(),
  minifyFontValues(),
  minifyGradients(),
  minifyParams(),
  minifySelectors(),
  discardUnused(),
  normalizeWhitespace(),
  discardDuplicates()
]
