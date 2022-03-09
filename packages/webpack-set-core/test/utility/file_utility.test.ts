import 'jest';
import path from 'path';
import { FileUtility } from '../../src/utility/file_utility';

describe('File Utility Test', () => {
    test('find', () => {
        const dirs = [__dirname, path.parse(__dirname).dir];
        const filePath = __filename;
        const fileName = `${path.parse(filePath).name}${path.parse(filePath).ext}`;
        expect(FileUtility.find(fileName, dirs)).toEqual(filePath);
        expect(FileUtility.find(fileName, [dirs[1]])).toBeUndefined();
        expect(FileUtility.find(filePath, dirs)).toBeUndefined();
    });
});
