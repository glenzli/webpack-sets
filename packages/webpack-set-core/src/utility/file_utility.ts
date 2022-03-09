import fs from 'fs';
import path from 'path';

export class FileUtility {
    /**
     * 在指定目录中查找文件 (Find file in given directories)
     * @param filename 文件名，也可以为相对路径 (filename or relative path)
     * @param searchPaths 搜索文件的目录 (the directories to search file)
     * @returns 文件的真实路径 (the first found path of file, or undefined if not found)
     */
    public static find(filename: string, searchPaths: string[]) {
        for (const searchPath of searchPaths) {
            const filePath = path.join(searchPath, filename);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        }
        return undefined;
    }
}
