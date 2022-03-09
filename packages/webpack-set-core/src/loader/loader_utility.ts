import { Visitor, transformSync, TransformOptions } from '@babel/core';

export class LoaderUtility {
    /**
     * 仅通过 visitor 对代码进行变换，排除 babel 一些默认参数比如 babelrc 的影响
     */
    public static visitorTransformSync(
        visitors: Visitor[],
        source: string,
        inputSourceMap?: TransformOptions['inputSourceMap'],
        sourceMaps?: TransformOptions['sourceMaps'],
    ) {
        return transformSync(source, {
            plugins: visitors.map(visitor => ({ visitor })),
            configFile: false,
            babelrc: false,
            inputSourceMap,
            sourceMaps,
        });
    }
}
