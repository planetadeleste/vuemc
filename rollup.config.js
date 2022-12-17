import * as _ from 'lodash';
import pkg from './package.json';
import typescript from 'typescript';
import ts_plugin2 from 'rollup-plugin-typescript2';
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

const moduleName = pkg.name.replace(/^@.*\//, "");
const author = pkg.author;
const banner = `
  /**
   * @license
   * @author ${author}
   * @version v${pkg.version}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;
const arExternals = [
  ...Object.keys(pkg.dependencies || {}),
];

const BASE = {
    external: arExternals,
    plugins: [
        resolve(),
        commonjs(),
        ts_plugin2({
            typescript,
            useTsconfigDeclarationDir: true,
        }),
    ],
};

const MAIN = _.assign({}, BASE, {
    input: 'src/index.ts',
    output: [
        {file: pkg.main, format: 'cjs', banner },
        {file: pkg.module, format: 'es', banner },
    ],
});

const VALIDATION = _.assign({}, BASE, {
    input: 'src/Validation/index.ts',
    output: [
        {file: 'validation/index.js', format: 'cjs'},
    ],
});

const LOCALES = _.assign({}, BASE, {
    input: './src/Validation/locale.ts',
    output: [
        {file: 'validation/locale.js', format: 'cjs'},
    ],
});

export default [
    MAIN,
    VALIDATION,
    LOCALES,
];
