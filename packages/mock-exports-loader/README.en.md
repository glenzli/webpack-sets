# Mock Exports Loader

👉[中文](./README.md)

MockExportsLoader converts exports of given module to empty functions by analyze module exports and type definition files (some compressed commonjs code may not be easy to extract exports by static analyze, thus we can use it's type definitions to extract exports).

Sometimes we may need to build special package for special purpose, and some module is not truly executed but cannot be shaked due to some side effects; we may use `null-loader` or `{ alias: { xx: false } }` to shake the module but the code may be broken after the shaking. MockExportsLoader is for such case that we can automatically 'mock' those modules and provide empty function like what we do for test.

## Roadmap

✅ Analyze exports by code

✅ Analyze exports by type definition files

🔳 Analyze exports type, distinguish function and const object or value

🔳 Provide type definition files for mock file

## How to use
### Install
```sh
npm i --save-dev mock-exports-loader
```
### Usage
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

### Loader Options
#### **parseFromType**
`boolean | undefined`, default is `false`

Whether to extract exports from type defintion file, recommend for compressed non-es6 module with type definitions. Support auto detect `@type/xxx` for lib `xxx`, e.g. for lib `module-a`, it will automatically search `@type/module-a` if `module-a` has no `types/typing` field in package.json.
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
`boolean | undefined`, default is `false`

Whether to merge all named exports to module's default export. e.g. for module `fs-extra`, we can use either `import fs from 'fs-extra' fs.readFileSync` or `import { readFileSync } from 'fs-extra'`,but automatic mock will create an empty default export due to the current static code analysis logic.
```javascript
// ...
module.exports.readFileSync = function () {};
// ...
module.exports.default = function () {};
```
Set `generateDefault` to `true` to make the mock `fs` object work as expected:
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
`(() => object) | undefined`, default is `undefined`

There could be some exports cannot be recognized or some constants mistakenly converted to empty function. We could provides a `createMocks` function to fix it.
```typescript
{
  test: /module-a/,
  loader: 'mock-exports-loader',
  options: {
    createMocks: () => ({ CONST_VALUE: 3 }),
  },
}
```
mock Result:
```javascript
module.exports.CONST_VALUE = 3;
```

## Known Issues
1. Due to current logic of static code analysis, it's not easy to distinguish function export and value object export. All exports will be convert to empty function, you must provide a `createMocks` to provide the correct constant exports.