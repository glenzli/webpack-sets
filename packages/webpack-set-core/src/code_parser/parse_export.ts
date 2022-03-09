export interface Identity {
    id: string;
    location: string;
}

/** 默认导出的 id (default) */
export const DEFUALT_ID = 'default';

class ExportParser {
    /** 模块原生的导出对象 */
    private originExports = new Map<string, string>();
    /** 从其他模块导入再导出的对象 */
    private reExports = new Map<string, Identity>();
    /** export * 的文件 */
    private moduleExports = new Set<string>();
    /** 从其他模块导入的对象 */
    private imports = new Map<string, Identity>();

    public constructor(private source: string) {
        this.parseImports();
        this.parseModuleExports();
        this.parseNamedExports();
        this.parseDefaultExport();
        this.parseInlineExports();
    }

    public get exports() {
        return {
            origin: this.originExports,
            reExports: this.reExports,
            modules: this.moduleExports,
        };
    }

    /**
     * 解析文件中导入对象
     */
    private parseImports() {
        const importRegex = /^\s*import\s+(([A-z0-9$_]+)\s*,?\s*)?(\{([^}]+)\})?(\s*,?\s*([A-z0-9$_]+))?\s*(from\s+['"]([^'"]+)['"])/gm;
        for (let match = importRegex.exec(this.source); match; match = importRegex.exec(this.source)) {
            const location = match[8].trim();
            // 解析 import X from 'x'
            const implicitDefault = (match[2] || match[6])?.trim();
            if (implicitDefault) {
                this.imports.set(implicitDefault, { id: DEFUALT_ID, location });
            }
            // 解析 import { X, X as X } from 'x'
            if (match[4]) {
                const importIds = match[4].split(',').map(id => id.trim());
                importIds.forEach(id => {
                    const [originId, importId] = parseAsExpr(id);
                    this.imports.set(importId, { id: originId, location });
                });
            }
        }
    }

    /**
     * 解析 export * from 'x'
     */
    private parseModuleExports() {
        // 解析 export * from 'x'
        const exportRegex = /^\s*export\s+\*\s+from\s+['"]([^'"]+)['"]/gm;
        for (let expr = exportRegex.exec(this.source); expr; expr = exportRegex.exec(this.source)) {
            this.moduleExports.add(expr[1]);
        }
    }

    /**
     * 解析 export {}
     */
    private parseNamedExports() {
        const exportRegex = /^\s*export\s+\{([^}]+)\}\s*(from\s+['"]([^'"]+)['"])?/gm;
        for (let match = exportRegex.exec(this.source); match; match = exportRegex.exec(this.source)) {
            const exportIds = match[1].split(',').map(symbol => symbol.trim());
            exportIds.forEach(id => {
                const [originId, exportId] = parseAsExpr(id);

                // ESLINT_FALSE_ALARM: for 循环内已经做了 match 不为空的判定
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const location = match![3]?.trim();
                if (location) {
                    // export {} from ...
                    this.reExports.set(exportId, { id: originId, location });
                } else {
                    // export {}
                    const sourceExport = this.imports.get(originId);
                    if (sourceExport) {
                        this.reExports.set(exportId, sourceExport);
                    } else {
                        this.originExports.set(exportId, originId);
                    }
                }
            });
        }
    }

    /** 解析 export default */
    private parseDefaultExport() {
        // export default XX | export default function|.. XX
        const regex = /^\s*export\s+default\s+(const|function|class|enum|type|interface|abstract)?\s*([A-z0-9$_]+)/gm;
        for (let match = regex.exec(this.source); match; match = regex.exec(this.source)) {
            this.originExports.set(DEFUALT_ID, match[2]);
        }
    }

    /** 解析直接的 export，如 export function */
    private parseInlineExports() {
        // export function|.. XX
        const regex = /^\s*export\s+(declare)?\s*(((const|function|class|enum|type|interface|abstract)\s+)*)([A-z0-9$_]+)\s*/gm;
        for (let match = regex.exec(this.source); match; match = regex.exec(this.source)) {
            if (!/type|interface/.test(match[2])) {
                this.originExports.set(match[5], match[5]);
            }
        }
    }
}

/** 拆分 x as x 语句 */
function parseAsExpr(expr: string) {
    const parsed = /([^\s]+)\sas\s([^\s]+)/.exec(expr);
    if (parsed) {
        return [parsed[1], parsed[2]];
    }
    return [expr, expr];
}

export function parseExports(source: string) {
    return new ExportParser(source).exports;
}
