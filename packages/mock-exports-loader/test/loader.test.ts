import 'jest';
import fs from 'fs';
import loader from '../src/loader';
import { ModuleUtility } from '@g4iz/webpack-set-core';

describe('mockExportsLoader', () => {
    test('mock fs-extra', () => {
        const resourcePath = ModuleUtility.resolveModuleEntry('fs-extra');
        const callback = jest.fn();
        const logger = { debug: jest.fn(), warn: jest.fn() };
        loader.call(
            // @ts-ignore
            {
                getOptions: () => ({}),
                // @ts-ignore
                getLogger: () => logger,
                resourcePath,
                callback,
            },
            fs.readFileSync(resourcePath, { encoding: 'utf-8' }),
        );

        expect(callback.mock.calls[0][1]).toMatchSnapshot();
    });

    test('mock fs-extra with types and generate default', () => {
        const resourcePath = ModuleUtility.resolveModuleEntry('fs-extra');
        const callback = jest.fn();
        const logger = { debug: jest.fn(), warn: jest.fn() };
        loader.call(
            // @ts-ignore
            {
                getOptions: () => ({ parseFromType: true, generateDefault: true }),
                // @ts-ignore
                getLogger: () => logger,
                resourcePath,
                callback,
            },
            fs.readFileSync(resourcePath, { encoding: 'utf-8' }),
        );

        expect(callback.mock.calls[0][1]).toMatchSnapshot();
    });

    test('mock fs-extra with types, generate default and custom mocks', () => {
        const resourcePath = ModuleUtility.resolveModuleEntry('fs-extra');
        const callback = jest.fn();
        const logger = { debug: jest.fn(), warn: jest.fn() };
        loader.call(
            // @ts-ignore
            {
                getOptions: () => ({
                    parseFromType: true,
                    generateDefault: true,
                    createMocks: () => ({ CONST: 3, STR: 'test', FUNC: () => 1 }),
                }),
                // @ts-ignore
                getLogger: () => logger,
                resourcePath,
                callback,
            },
            fs.readFileSync(resourcePath, { encoding: 'utf-8' }),
        );

        expect(callback.mock.calls[0][1]).toMatchSnapshot();
    });
});
