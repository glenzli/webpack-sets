import { uniq, forEach } from 'lodash';
import { LoaderDefinitionFunction, WebpackError } from 'webpack';
import { ModuleUtility, LoaderSchema, DEFUALT_ID } from '@g4iz/webpack-set-core';
import { parseExportIdsFrom, pasreExportIdsFromType } from './parse_export_ids';

export interface MockExportsLoaderOptions {
    /** 尝试从 type 文件中获取类型 */
    parseFromType?: boolean;
    /** 利用所有的 exports 合成为 default 导出 */
    generateDefault?: boolean;
    /** 自定义的 mock */
    createMocks?: () => Record<string, unknown>;
}

const LOADER = 'MockExportsLoader';

const schema: LoaderSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        parseFromType: { type: 'boolean' },
        generateDefault: { type: 'boolean' },
        createMocks: { instancof: 'Function' },
    },
};

/**
 * 将指定模块编译为空mock，导出转换为空函数
 */
const loader: LoaderDefinitionFunction<MockExportsLoaderOptions> = function (this, source, sourceMap, meta) {
    const options = this.getOptions(schema);

    const exportIds = parseExportIdsFrom(source);
    const logger = this.getLogger(LOADER);
    logger.debug(`Types extracted from source '${this.resourcePath}'`, exportIds);

    if (options.parseFromType) {
        const typeEntry = ModuleUtility.resolveTypeFile(this.resourcePath);
        if (typeEntry) {
            // 尝试从类型中提取
            const typeExportIds = pasreExportIdsFromType(typeEntry);
            logger.debug(`Types extracted from type '${typeEntry}'`, typeExportIds);
            exportIds.push(...typeExportIds);
        } else {
            logger.warn(`Cannot find type file for '${this.resourcePath}'`);
        }
    }

    const mockIds = uniq(exportIds);

    if (mockIds.length > 0 || options.createMocks) {
        const mockSource = generateMockCode(mockIds, options);
        this.callback(null, mockSource, undefined, meta);
        return;
    }

    const warning = new WebpackError('[mock-exports-loader] Cannot find exports and no custom mock is provided.');
    warning.file = this.resourcePath;
    this._compilation?.warnings.push(warning);

    this.callback(null, source, sourceMap ?? undefined, meta);
};

function generateMockCode(mockIds: string[], options: MockExportsLoaderOptions) {
    const mocks: Record<string, string> = {};
    // 因为导出类型较难直观识别，导出均转换为空 function
    mockIds.forEach(fn => mocks[fn] = 'function() {}');

    const mockCodes = ['Object.defineProperty(exports, "__esModule", { value: true });'];

    // 应用传入的自定义mock
    const customMockFn = options.createMocks?.toString();
    if (customMockFn) {
        mockCodes.push(`Object.assign(exports, (${customMockFn})());`);
    }

    // 生成exports.x = xxx形式的代码
    forEach(mocks, (value, key) => {
        if (!options.generateDefault || key !== DEFUALT_ID) {
            mockCodes.push(`exports.${key} = ${value};`);
        }
    });

    // 合成默认导出
    if (options.generateDefault) {
        mockCodes.push(`exports.${DEFUALT_ID} = Object.assign({}, exports);`);
    }

    return mockCodes.join('\n');
}

export default loader;
