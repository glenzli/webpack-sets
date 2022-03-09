import path from 'path';
import fs from 'fs';
import { FileUtility } from './file_utility';

const PKG_JSON = 'package.json';

export class ModuleUtility {
    /**
     * 根据模块名获取模块路径
     * @param moduleId 模块名
     * @param paths 从指定的目录进行解析
     * @returns 模块路径
     */
    public static resolveModuleEntry(moduleId: string, paths?: string[]) {
        return require.resolve(moduleId, { paths });
    }

    /**
     * 根据模块的入口文件解析 package.json 的路径 (resolve path of package.json by module entry)
     * @param moduleEntry 模块入口文件绝对路径 (absolute path of module entry)
     */
    public static resolvePackageJson(moduleEntry: string) {
        const pathMatch = /.+[\\/]node_modules[\\/]((@[^\\/]+)[\\/])?([^\\/]+)[\\/]/.exec(moduleEntry);
        if (pathMatch) {
            const packageJson = path.resolve(pathMatch[0], PKG_JSON);
            if (fs.existsSync(packageJson)) {
                return packageJson;
            }
        } else {
            const paths = [path.dirname(moduleEntry)];
            for (let i = 0; i < 2; ++i) {
                paths.push(path.dirname(paths[paths.length - 1]));
            }
            return FileUtility.find(PKG_JSON, paths);
        }
        return undefined;
    }

    /**
     * 根据模块入口文件获取类型文件的路径 (resolve type file path by module entry)
     * @param moduleEntry 模块入口文件绝对路径 (absolute path of module entry)
     */
    public static resolveTypeFile(moduleEntry: string) {
        const packageJsonPath = this.resolvePackageJson(moduleEntry);
        if (packageJsonPath) {
            const ownTypeFile = this.resolveTypeFileFromPackageJson(packageJsonPath);
            if (ownTypeFile) {
                return ownTypeFile;
            }
        }

        const typeModulePath = this.resolveTypeModule(moduleEntry);
        if (typeModulePath) {
            return this.resolveTypeFileFromPackageJson(path.join(typeModulePath, PKG_JSON));
        }

        return undefined;
    }

    /**
     * 获取专有的 @types 模块的目录
     * @param moduleEntry 模块入口文件绝对路径 (absolute path of module entry)
     */
    private static resolveTypeModule(moduleEntry: string) {
        const pathMatch = /(.+[\\/]node_modules[\\/])(((@[^\\/]+)[\\/])?([^\\/]+))[\\/]/.exec(moduleEntry);
        if (pathMatch) {
            // @xx/yy 对应的类型包名为 @types/xx__yy，xx 对应的类型包名为 @types/xx
            const typeModuleId = `@types/${pathMatch[2].startsWith('@') ? pathMatch[2].slice(1).replace(/[\\/]/, '__') : pathMatch[2]}`;
            if (/\.pnpm/.test(pathMatch[1])) {
                // pnpm 的安装目录比较特别
                const installRoot = /.+[\\/]node_modules[\\/]\.pnpm/.exec(pathMatch[1])?.[0];
                if (installRoot) {
                    const targetDirPrefix = typeModuleId.replace(/[\\/]/, '+');
                    const targetDir = fs.readdirSync(installRoot).find(target => target.startsWith(targetDirPrefix));
                    if (targetDir) {
                        return path.join(installRoot, targetDir, 'node_modules', typeModuleId);
                    }
                }
            } else {
                return path.resolve(pathMatch[1], typeModuleId);
            }
        }
        return undefined;
    }

    /**
     * 从 package.json 中解析类型字段
     * @param packageJsonPath packageJson 文件路径
     * @returns 类型文件的路径
     */
    private static resolveTypeFileFromPackageJson(packageJsonPath: string) {
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
            const typeField: string = packageJson.types || packageJson.typings;
            if (typeField) {
                const filePath = path.isAbsolute(typeField)
                    ? typeField : path.resolve(path.dirname(packageJsonPath), typeField);
                if (fs.existsSync(filePath)) {
                    return filePath;
                }
            }
        }
        return undefined;
    }
}
