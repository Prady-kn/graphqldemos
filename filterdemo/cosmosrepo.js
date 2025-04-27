import { config } from "dotenv"
config();


import { CosmosClient } from "@azure/cosmos"
import { gql } from 'apollo-server'
import { setLogLevel } from "@azure/logger";

setLogLevel("info");



// Connect to Cosmos DB
// Initialize Cosmos DB client
const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,

});


const database = client.database("truck");
const container = database.container("movies");

function buildWhereClause(filter, params = [], paramPrefix = "param") {
    let whereParts = [];
    let paramIndex = params.length;

    const handleComparison = (field, operator, value) => {
        params.push({ name: `@${paramPrefix}_${paramIndex}`, value });
        whereParts.push(`c.${field} ${operator} @${paramPrefix}_${paramIndex}`);
        paramIndex++;
    };

    if (filter.and) {
        const clauses = filter.and.map(f =>
            `(${buildWhereClause(f, params, `${paramPrefix}_a${paramIndex}`)})`
        ).filter(c => c !== '()');
        if (clauses.length > 0) {
            whereParts.push(clauses.join(' AND '));
        }
    }
    else if (filter.or) {
        const clauses = filter.or.map(f =>
            `(${buildWhereClause(f, params, `${paramPrefix}_o${paramIndex}`)})`
        ).filter(c => c !== '()');
        if (clauses.length > 0) {
            whereParts.push(clauses.join(' OR '));
        }
    }
    else if (filter.not) {
        const clause = buildWhereClause(filter.not, params, `${paramPrefix}_n${paramIndex}`);
        whereParts.push(`NOT (${clause})`);
    }
    else {
        for (const [field, conditions] of Object.entries(filter)) {
            if (typeof conditions === 'object') {
                Object.entries(conditions).forEach(([operator, value]) => {
                    switch (operator) {
                        case 'eq':
                            handleComparison(field, '=', value);
                            break;
                        case 'gt':
                            handleComparison(field, '>', value);
                            break;
                        case 'lt':
                            handleComparison(field, '<', value);
                            break;
                        case 'contains':
                            // Remove % wildcards for CONTAINS
                            params.push({ name: `@${paramPrefix}_${paramIndex}`, value });
                            whereParts.push(`CONTAINS(c.${field}, @${paramPrefix}_${paramIndex})`);
                            paramIndex++;
                            break;
                        case 'in':
                            if (Array.isArray(value) && value.length > 0) {
                                const inParams = value.map((val, idx) => {
                                    const paramName = `@${paramPrefix}_${paramIndex + idx}`;
                                    params.push({ name: paramName, value: val });
                                    return paramName;
                                });
                                paramIndex += value.length;
                                whereParts.push(`c.${field} IN (${inParams.join(', ')})`);
                            }
                            break;
                    }
                });
            }
        }
    }

    return whereParts.join(' AND ') || '1=1';
}

// // Recursive filter-to-SQL converter
// function buildWhereClause(filter, params = [], paramPrefix = "param") {
//     let whereParts = [];
//     let paramIndex = params.length;

//     const handleComparison = (field, operator, value) => {
//         params.push({ name: `@${paramPrefix}_${paramIndex}`, value });
//         whereParts.push(`c.${field} ${operator} @${paramPrefix}_${paramIndex}`);
//         paramIndex++;
//     };

//     if (filter.and) {
//         const clauses = filter.and.map(f =>
//             `(${buildWhereClause(f, params, `${paramPrefix}_a${paramIndex}`)})`
//         ).filter(c => c !== '()');  // Remove empty clauses
//         if (clauses.length > 0) {
//             whereParts.push(`(${clauses.join(' AND ')})`);
//         }
//     }
//     else if (filter.or) {
//         const clauses = filter.or.map(f =>
//             `(${buildWhereClause(f, params, `${paramPrefix}_o${paramIndex}`)})`
//         ).filter(c => c !== '()');
//         if (clauses.length > 0) {
//             whereParts.push(`(${clauses.join(' OR ')})`);
//         }
//     }
//     else {
//         for (const [field, conditions] of Object.entries(filter)) {
//             if (typeof conditions === 'object') {
//                 Object.entries(conditions).forEach(([operator, value]) => {
//                     switch (operator) {
//                         case 'eq':
//                             handleComparison(field, '=', value);
//                             break;
//                         case 'gt':
//                             handleComparison(field, '>', value);
//                             break;
//                         case 'lt':
//                             handleComparison(field, '<', value);
//                             break;
//                         case 'contains':
//                             // Remove % wildcards for CONTAINS
//                             params.push({ name: `@${paramPrefix}_${paramIndex}`, value });
//                             whereParts.push(`CONTAINS(c.${field}, @${paramPrefix}_${paramIndex})`);
//                             paramIndex++;
//                             break;
//                     }
//                 });
//             }
//         }
//     }

//     return whereParts.join(' AND ');
// }


// Updated resolver with Cosmos DB integration
const resolvers = {
    Query: {
        searchMovies: async (_, { filter }) => {
            let querySpec = {
                query: "SELECT c.id, c.title, c.director, c.year FROM c",
                parameters: []
            };

            if (filter) {
                const whereClause = buildWhereClause(filter, querySpec.parameters);
                querySpec.query += ` WHERE ${whereClause}`;
            }

            console.log(`Executing: ${querySpec.query}`);
            const response = await container.items
                .query(querySpec)
                .fetchAll();
            console.log(`RU Used: ${response.requestCharge}`);

            return response.resources;
        }
    }
};



// GraphQL type definitions
const typeDefs = gql`
  input StringFilter {
    eq: String
    contains: String
    in: [String!]  
  }

  input IntFilter {
    eq: Int
    gt: Int
    lt: Int
    in: [Int!]  # Add this
  }

  input MovieFilter {
    and: [MovieFilter!]
    or: [MovieFilter!]
    not: MovieFilter
    title: StringFilter
    director: StringFilter
    year: IntFilter
  }

  type Movie {
    id: ID!
    title: String!
    director: String!
    year: Int!
  }

  type Query {
    searchMovies(filter: MovieFilter): [Movie!]!
  }
`;

export { resolvers, typeDefs }