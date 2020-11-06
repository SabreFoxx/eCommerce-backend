import env from 'dotenv';
import knex from 'knex';
env.config();

export const RECORD_ALREADY_EXISTS = 23505;

const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const snakeToCamelCase = str => str.toLowerCase().replace(/([-_][a-z])/g, group => group
    .toUpperCase()
    .replace('-', '')
    .replace('_', '')
);

function toCamelCasedObject(object) {
    let keys = Object.keys(object);
    let n = keys.length;
    let newObject = new Object;
    while (n--) {
        let key = keys[n];
        if (typeof object[key] === 'string')
            newObject[snakeToCamelCase(key)] = snakeToCamelCase(object[key]);
        else
            newObject[snakeToCamelCase(key)] = object[key];
    }
    return newObject;
}

// console.log(toCamelCasedObject({
//     account_id: 11,
//     first_name: 'Chinyere',
//     last_name: 'Odinukwe',
//     email: 'chinyere@chinyere.com',
//     password: 'a4ebfcfea7446813194438e586b410483368a6141fcdba755e99c81b6589e43ebfec2463161f57bec7882e958694146eca55a9c110de7c65b4c8e359fc5fb071',
//     other: null,
//     password_salt: 'd38ae779ee23de3b63d89868b73b661f'
// }));

const db = knex({
    client: 'pg',
    // connection: 'postgres://username:password@host:port/database'
    connection: process.env.DATABASE_CONNECTION_STRING,
    searchPath: ['basic', 'public'],
    // snake_case -> camelCase converter
    postProcessResponse: (result, queryContext) => {
        // TODO: add special case for raw results (depends on dialect)
        if (Array.isArray(result)) {
            return result.map(row => toCamelCasedObject(row));
        } else {
            return toCamelCasedObject(result);
        }
    },
    // camelCase -> snake_case converter
    wrapIdentifier: (value, origImpl, queryContext) => origImpl(camelToSnakeCase(value))
});

export default db;