module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  env: {
    production: {
      presets: ['minify'],
    },
  },
  plugins: ['@babel/plugin-transform-runtime'],
};
