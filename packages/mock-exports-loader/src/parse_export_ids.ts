import fs from 'fs';
import path from 'path';
import { NodePath, Visitor, types } from '@babel/core';
import { parseExports, DEFUALT_ID, LoaderUtility } from '@g4iz/webpack-set-core';

export function pasreExportIdsFromType(typeEntryPath: string): string[] {
    const declareCode = fs.readFileSync(typeEntryPath, { encoding: 'utf-8' });
    const exports = parseExports(declareCode);
    const exportIds = [...exports.origin.keys(), ...exports.reExports.keys()];
    exports.modules.forEach(mod => {
        // relative path
        if (mod.startsWith('.')) {
            const typeModulePath = path.resolve(path.dirname(typeEntryPath), mod);
            const realTypeModulePath = [`${typeModulePath}.d.ts`, path.join(typeModulePath, 'index.d.ts')].find(fs.existsSync);
            if (realTypeModulePath) {
                exportIds.push(...pasreExportIdsFromType(realTypeModulePath));
            }
        }
    });
    return exportIds;
}

export function parseExportIdsFrom(sourceCode: string): string[] {
    const exportIds: string[] = [];
    LoaderUtility.visitorTransformSync([createExportParseVisitor(exportIds)], sourceCode);
    return exportIds;
}

function createExportParseVisitor(exportIds: string[]): Visitor {
    return {
        // 收集 export { a, b } 类型的导出
        ExportSpecifier: {
            enter(nodePath) {
                const { exported } = nodePath.node;
                if (types.isIdentifier(exported)) {
                    exportIds.push(exported.name);
                }
            },
        },
        // 收集 export function a() {} 类型的导出
        ExportNamedDeclaration: {
            enter(nodePath) {
                const { declaration } = nodePath.node;
                if ((types.isFunctionDeclaration(declaration)) && declaration.id) {
                    const { name } = declaration.id;
                    exportIds.push(name);
                }
            },
        },
        // 收集 export default
        ExportDefaultSpecifier: {
            enter() {
                exportIds.push(DEFUALT_ID);
            },
        },
        // 收集 module.exports 的导出
        MemberExpression: {
            enter(nodePath) {
                if (isModuleExports(nodePath)) {
                    if (types.isAssignmentExpression(nodePath.parentPath.node) &&
                        types.isExpressionStatement(nodePath.parentPath.parentPath?.node)) {
                        // module.exports = xxx
                        const assignment = nodePath.parentPath.node;
                        if (types.isExpression(assignment.right)) {
                            exportIds.push(DEFUALT_ID);
                        }
                    } else if (types.isMemberExpression(nodePath.parentPath.node)) {
                        // module.exports.xxx = xxx
                        const namedExport = nodePath.parentPath.node.property;
                        if (types.isIdentifier(namedExport)) {
                            exportIds.push(namedExport.name);
                        }
                    }
                } else if (isExports(nodePath)) {
                    const namedExport = nodePath.node.property as types.Identifier;
                    if (namedExport.name === 'default') {
                        // exports.default = xxx
                        exportIds.push(DEFUALT_ID);
                    } else {
                        // exports.xxx = xxx
                        exportIds.push(namedExport.name);
                    }
                }
            },
        },
    };
}

function isModuleExports(nodePath: NodePath<types.MemberExpression>) {
    return types.isIdentifier(nodePath.node.object, { name: 'module' }) &&
        types.isIdentifier(nodePath.node.property, { name: 'exports' });
}

function isExports(nodePath: NodePath<types.MemberExpression>) {
    return types.isIdentifier(nodePath.node.object, { name: 'exports' }) &&
        types.isAssignmentExpression(nodePath.parentPath.node) &&
        types.isExpression(nodePath.parentPath.node.right) &&
        types.isIdentifier(nodePath.node.property);
}
