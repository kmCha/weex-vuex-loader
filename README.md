# Useage
```bash
npm install --save weex-vuex-loader
```
then install [vuex-weex](https://github.com/kmCha/vuex-weex).

then open `webpack.config.js`，add 'weex-vuex-loader' after 'weex-loader'：

```js
  // ...
  module: {
    loaders: [
      {
        test: /\.we(\?[^?]+)?$/,
        loaders: ['weex-loader', 'weex-vuex-loader?store']
      }
    ]
  }
  // ...
```

query `'store'` after `?` means you can access your Vuex `store` inside weex component like `this.store`. If you don't specify the query, the default will be `this._store`.
