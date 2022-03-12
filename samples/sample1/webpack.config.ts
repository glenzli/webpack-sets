import { Configuration } from 'webpack';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const configuration: Configuration = {
    mode: isProd ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/index.ts'),
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /fs-extra/,
                use: {
                    loader: 'mock-exports-loader',
                    options: {
                        parseFromType: true,
                        generateDefault: true,
                    },
                },
            },
        ],
    },
    devtool: false,
};

export default configuration;
