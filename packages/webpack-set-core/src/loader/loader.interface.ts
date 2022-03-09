import { validateSchema } from 'webpack';

export type LoaderSchema = Parameters<typeof validateSchema>[0];
