import 'jest';
import fs from 'fs';
import { ModuleUtility } from '../../src/utility/module_utility';

describe('File Utility Test', () => {
    test('resolvePackageJson node_modules', () => {
        const pkgJson = ModuleUtility.resolvePackageJson(require.resolve('typescript'));
        expect(pkgJson).not.toBeUndefined();
        if (pkgJson) {
            expect(fs.existsSync(pkgJson)).toBe(true);
            expect(JSON.parse(fs.readFileSync(pkgJson, { encoding: 'utf-8' })).name).toEqual('typescript');
        }
    });

    test('resolvePackageJson project file', () => {
        const pkgJson = ModuleUtility.resolvePackageJson(__filename);
        expect(pkgJson).not.toBeUndefined();
        if (pkgJson) {
            expect(fs.existsSync(pkgJson)).toBe(true);
            expect(JSON.parse(fs.readFileSync(pkgJson, { encoding: 'utf-8' })).name).toEqual('@g4iz/webpack-set-core');
        }
    });

    test('resolveTypeFile own', () => {
        const typeFile = ModuleUtility.resolveTypeFile(ModuleUtility.resolveModuleEntry('webpack'));
        expect(typeFile).not.toBeUndefined();
        if (typeFile) {
            expect(typeFile).toMatch(/webpack[\\/].*\.d\.ts$/);
        }
    });

    test('resolveTypeFile external', () => {
        const typeFile = ModuleUtility.resolveTypeFile(ModuleUtility.resolveModuleEntry('@babel/core'));
        expect(typeFile).not.toBeUndefined();
        if (typeFile) {
            expect(typeFile).toMatch(/babel__core[\\/].*\.d\.ts$/);
        }
    });
});
