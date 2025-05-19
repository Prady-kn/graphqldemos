// Movie Service - movie-service/index.js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';

import {applyFilters} from '../shared/applyfilters.js';


const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", 
    import: ["@key", "@shareable"])

  type Movie @key(fields: "id") {
    id: ID!
    title: String!
    year: Int
    genre: String
    rating: Float
  }

  input MovieFilter {
    and: [MovieFilter]
    or: [MovieFilter]
    id: IDFilter
    title: StringFilter
    year: IntFilter
    genre: StringFilter
    rating: FloatFilter
  }

  type Query {
    movies(filter: MovieFilter): [Movie!]!
    movie(id: ID!): Movie
  }

  # Filter input types
  input IDFilter {
    eq: ID
    in: [ID!]
  }

  input StringFilter {
    eq: String
    contains: String
    startsWith: String
    in: [String!]
  }

  input IntFilter {
    eq: Int
    gt: Int
    gte: Int
    lt: Int
    lte: Int
    in: [Int!]
  }

  input FloatFilter {
    eq: Float
    gt: Float
    gte: Float
    lt: Float
    lte: Float
    in: [Float!]
  }
`;

const movies = [
  { id: '1', title: 'Inception', year: 2010, genre: 'Sci-Fi', rating: 8.8 },
  { id: '2', title: 'The Matrix', year: 1999, genre: 'Sci-Fi', rating: 8.7 },
];

const resolvers = {
  Query: {
    movies: (_, { filter }) => filterMovies(movies, filter),
    movie: (_, { id }) => movies.find(m => m.id === id)
  },
  Movie: {
    __resolveReference(movie) {
      return movies.find(m => m.id === movie.id);
    }
  }
};

function filterMovies(movies, filter) {
  if (!filter) return movies;
  return movies.filter(movie => applyFilters(movie, filter));
}



// function applyFilters(item, filter) {
//   if (filter.and) return filter.and.every(f => applyFilters(item, f));
//   if (filter.or) return filter.or.some(f => applyFilters(item, f));
  
//   return Object.entries(filter).every(([field, conditions]) => {
//     const value = item[field];
//     return Object.entries(conditions).every(([op, val]) => {
//       switch(op) {
//         case 'eq': return value === val;
//         case 'gt': return value > val;
//         case 'gte': return value >= val;
//         case 'lt': return value < val;
//         case 'lte': return value <= val;
//         case 'in': return val.includes(value);
//         case 'contains': return value.includes(val);
//         case 'startsWith': return value.startsWith(val);
//         default: return true;
//       }
//     });
//   });
// }

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

startStandaloneServer(server, { listen: { port: 4001 } });
