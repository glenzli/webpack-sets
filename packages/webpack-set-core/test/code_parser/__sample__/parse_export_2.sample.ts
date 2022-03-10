export * from './parse_export_1.sample';

function local() {
    return 'local';
}

export { local as exportLocal };

const CA = 0;
const CB = 1;
const CD = 2;

export { CA, CB, CD as CC };
