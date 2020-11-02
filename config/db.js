import env from 'dotenv';
import knex from 'knex';
env.config();

export const RECORD_ALREADY_EXISTS = 23505;

const convertToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertToCamel = str => str.toLowerCase().replace(/([-_][a-z])/g, group => group
    .toUpperCase()
    .replace('-', '')
    .replace('_', '')
);

const db = knex({
    client: 'pg',
    // connection: 'postgres://username:password@host:port/database'
    connection: process.env.DATABASE_CONNECTION_STRING,
    searchPath: ['basic', 'public'],
    // snake_case -> camelCase converter
    postProcessResponse: (result, queryContext) => {
        // TODO: add special case for raw results (depends on dialect)
        if (Array.isArray(result)) {
            return result.map(row => convertToCamel(row));
        } else {
            return convertToCamel(result);
        }
    },
    // camelCase -> snake_case converter
    wrapIdentifier: (value, origImpl, queryContext) => origImpl(convertToSnakeCase(value))
});

export default db;