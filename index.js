var path = require('path');
var store = require(path.resolve('src/vuex/store'));

module.exports = function(source) {
  source = addStoreDependence(source, this);
  source = bindStoreToVm(source, this);
  return source;
}

function getPropertyString(source, property) {
  var initialIndex = index = source.indexOf(property);
  var lIndex = source.indexOf('{', index);
  var rIndex = -1;
  var indexArr = [];
  if (index > 0) {
    indexArr.push(lIndex);
    index = lIndex;
    while (indexArr.length > 0) {
      lIndex = source.indexOf('{', index + 1);
      rIndex = source.indexOf('}', index + 1);
      if (lIndex < rIndex && lIndex !== -1 && rIndex !== -1) {
        indexArr.push(lIndex);
        index = lIndex;
      } else {
        indexArr.pop();
        index = rIndex;
      }
    }
    if (indexArr.length === 0) {
      return source.substring(initialIndex, index+1);
    }
  }
}

function insertAfterString(source, string, insert) {
  if (source.indexOf(string) < 0) return source;
  var splitedSource = source.split(string);
  if (splitedSource.length > 2) return source;
  var firstPart = splitedSource[0];
  var secondPart = splitedSource[1];
  var insertAdded = insert.concat(secondPart);
  var stringAdded = (string + '\n').concat(insertAdded);
  var ret = firstPart.concat(stringAdded);
  return ret;
}

function addStoreDependence(source, context) {
  var relativePathToStore = path.relative(path.dirname(context.resourcePath), path.resolve('src/vuex/store'));
  if (relativePathToStore.indexOf('.') !== 0) {
    relativePathToStore = './'.concat(relativePathToStore);
  }
  var insert = "    var __store__ = require('" + relativePathToStore + "');\n";     // 给每个.we文件引入var __store__ = require(store)
  return insertAfterString(source, '<script>', insert);
}

function bindStoreToVm(source, context) {                               // 将每个.we文件中引入的__store__绑定到data的$store上，this.$store就能访问到了
  var storeName = context.query ? context.query.substr(1) : '_store';   // 根据webpack.config.js文件中weex-vuex-loader指定的query来定制weex vm中访问$store的方式
  var dataString = initialDataString = getPropertyString(source, 'data');
  var indexOfDataString = -1;
  var initialLengthOfDataString = 0;
  var insert = '';
  var match;
  if (!initialDataString) {      // 如果.we文件中没有data
    insert = 'data: function() {\n  return {\n    ' + storeName + ': __store__,\n    state' + Math.floor(Math.random()*1000) + ': __store__.state\n    }\n  },';
    match = source.match(/module\.exports\s*\=\s*\{/);
    console.log(match)
    if (match && match.length > 0) {
      return insertAfterString(source, match[0], insert);
    }
  } else {
    indexOfDataString = source.indexOf(initialDataString);
    initialLengthOfDataString = initialDataString.length;
    insert = '    ' + storeName + ': __store__,\n    state' + Math.floor(Math.random()*1000) + ': __store__.state,';
    match = initialDataString.match(/data\:\s*function\s*\(\)\s*\{/);
    if (match && match.length > 0) {    // data是function() {return {}} 写法的情况
        dataString = insertAfterString(initialDataString, 'return {', insert);
      return source.replace(initialDataString, dataString);
    } else {          // data是{}的写法的情况
      match = initialDataString.match(/data\s*\:\s*\{/);
      if (match && match.length > 0) {
        return insertAfterString(source, match[0], insert);
      }
    }
  }
  return source;
}
