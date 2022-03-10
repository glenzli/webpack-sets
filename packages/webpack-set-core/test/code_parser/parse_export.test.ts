import 'jest';
import fs from 'fs';
import path from 'path';
import { parseExports } from '../../src/code_parser/parse_export';

describe('ParseExport Test', () => {
    test('parseExport sample 1', () => {
        const sample = path.resolve(__dirname, './__sample__/parse_export_1.sample.ts');
        const sampleCode = fs.readFileSync(sample, { encoding: 'utf-8' });
        expect(parseExports(sampleCode)).toMatchSnapshot();
    });

    test('parseExport sample 2', () => {
        const sample = path.resolve(__dirname, './__sample__/parse_export_2.sample.ts');
        const sampleCode = fs.readFileSync(sample, { encoding: 'utf-8' });
        expect(parseExports(sampleCode)).toMatchSnapshot();
    });

    test('parseExport sample 3', () => {
        const sample = path.resolve(__dirname, './__sample__/parse_export_3.sample.ts');
        const sampleCode = fs.readFileSync(sample, { encoding: 'utf-8' });
        expect(parseExports(sampleCode)).toMatchSnapshot();
    });
});
