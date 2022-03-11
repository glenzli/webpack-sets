# Mock Exports Loader

👉[English](./README.en.md)

MockExportsLoader 可以将指定模块中的导出全部转换为空方法。支持分析模块代码及类型文件（ 一些 cjs 代码可能难以提取 exports，此时如果有类型定义，可以通过类型定义提取 exports ）。

某些情况，当项目构建一些特殊包时，可能存在一些逻辑并没有实际执行，但是其依赖的模块会导致额外的打包或者运行出错的情况。但是这些模块不能直接采用 `null-loader` 或者 `alias: { xx: false }` 的方式置空，否则会导致编译失败。此时，可以使用 MockExportsLoader 将模块编译为一个 mock 模块。

## 主要功能及路线图

✅ 基于代码解析 exports

✅ 基于类型解析 exports

🔳 基于类型解析 exports 的具体类型，区分函数与值

🔳 提供 mock 的类型声明文件

## 使用方法
### 安装
```sh
npm i --save-dev mock-exports-loader
```
### 用法
```typescript
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /target_module/,
        loader: 'mock-exports-loader',
        options: {
          parseFromType: false,
          generateDefault: false,
          createMocks: () => ({}),
        },
      }
    ],
  },
  // ...
}
```

### Loader 选项
#### **parseFromType**
`boolean | undefined`，默认为 `false`

是否从类型中提取 exports，对于 es5 的库代码且存在类型定义的情况下，建议开启该选项。支持自动识别 `@types/xxx`，比如，对于库 `module-a`，如果库的 package.json 不包含 `types/typing` 字段，则会自动搜索`@types/module-a`。
```typescript
{
  test: /module-a/,
  loader: 'mock-exports-loader',
  options: {
    parseFromType: true,
  },
}
```

#### **generateDefault**
`boolean | undefined`，默认为 `false`

是否将所有命名导出合称为一个默认导出，举个例子，对于 `fs-extra` 模块，既可以使用`import { readFileSync } from 'fs-extra'`，也可以使用`import fs from 'fs-extra'; fs.readFileSync`，但是由于当前的代码静态解析的逻辑的一些问题，这个默认导出会被转换为空：
```javascript
// ...
module.exports.readFileSync = function () {};
// ...
module.exports.default = function () {};
```
开启 `generateDefault` 选项后，可以使假的 `fs` 对象可用：
```javascript
// ...
module.exports.readFileSync = function () {};
// ...
module.exports.default = {
  // ...
  readFileSync: function () {};
  // ...
};
``` 

#### **createMocks**
`(() => object) | undefined`，默认为空

可能存在一些 exports 未能正常识别，或者某些导出是常量却转化为了 function，可以通过传入自定义的 createMocks 进行修正。
```typescript
{
  test: /module-a/,
  loader: 'mock-exports-loader',
  options: {
    createMocks: () => ({ CONST_VALUE: 3 }),
  },
}
```
mock 结果：
```javascript
module.exports.CONST_VALUE = 3;
```

## 已知问题

1. 由于静态分析从导出代码中区分导出对象是类型还是函数比较麻烦，目前，会将所有导出转化为空方法。如果依赖 const 变量，可以通过传入自定义 createMocks 替代。
