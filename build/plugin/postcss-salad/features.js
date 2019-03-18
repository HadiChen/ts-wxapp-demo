export default {
  url: (options) => require('postcss-url')(options),
  bem: (options) => require('saladcss-bem')(options),
  // precss: (options) => require('precss')(options),
  color: (options) => require('postcss-color-function')(options),
  sassColor: (options) => require('postcss-sass-color-functions')(options),
  reset: (options) => require('postcss-css-reset')(options),
  utils: (options) => require('postcss-utils')(options),
  // calc: (options) => require('postcss-calc')(options),
  initial: (options) => require('postcss-initial')(options),
  inlineSvg: (options) => require('postcss-inline-svg')(options),
  short: (options) => require('postcss-short')(options),
  shape: (options) => require('postcss-shape')(options),
  rem: (options) => require('pixrem')(options),
  autoprefixer: (options) => require('autoprefixer')(options),
  neat: (options) => require('postcss-neat')(options)
}
