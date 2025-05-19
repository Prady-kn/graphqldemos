// Review Service - review-service/index.js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import {applyFilters } from '../shared/applyfilters.js'

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", 
    import: ["@key", "@external"])

  type Review @key(fields: "id") {
    id: ID!
    movieId: ID!
    score: Int
    comment: String
  }

  extend type Movie @key(fields: "id") {
    id: ID! @external
    reviews(filter: ReviewFilter): [Review!]!
  }

  input ReviewFilter {
    and: [ReviewFilter]
    or: [ReviewFilter]
    score: IntFilter
    comment: StringFilter
  }

  type Query {
    reviews(filter: ReviewFilter): [Review!]!
  }

  # Reuse filter inputs from Movie service
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
`;

const reviews = [
  { id: 'r1', movieId: '1', score: 5, comment: 'Mind-blowing!' },
  { id: 'r2', movieId: '1', score: 4, comment: 'Great visuals' },
   { id: 'r3', movieId: '2', score: 1, comment: 'Just OK' },
];

const resolvers = {
  Query: {
    reviews: (_, { filter }) => filterReviews(reviews, filter)
  },
  Movie: {
    reviews: (movie, { filter }) => 
      filterReviews(reviews.filter(r => r.movieId === movie.id), filter)
  },
  Review: {
    __resolveReference(review) {
      return reviews.find(r => r.id === review.id);
    }
  }
};

function filterReviews(reviews, filter) {
  if (!filter) return reviews;
  return reviews.filter(review => applyFilters(review, filter));
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

// Reuse same filter logic as Movie service
// import applyFilters from '../shared/filters';

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

startStandaloneServer(server, { listen: { port: 4002 } });
