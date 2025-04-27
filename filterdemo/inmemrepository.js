import {gql} from 'apollo-server'

// In-memory movie database
 const movies = [
    { id: '1', title: 'Inception', director: 'Christopher Nolan', year: 2010 },
    { id: '2', title: 'The Matrix', director: 'Lana Wachowski', year: 1999 },
    { id: '3', title: 'Interstellar', director: 'Christopher Nolan', year: 2014 },
    { id: '4', title: 'The Dark Knight', director: 'Christopher Nolan', year: 2008 },
    { id: '5', title: 'Pulp Fiction', director: 'Quentin Tarantino', year: 1994 },
  ];

  // GraphQL type definitions
const typeDefs = gql`
input StringFilter {
  eq: String
  contains: String
}

input IntFilter {
  eq: Int
  gt: Int
  lt: Int
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


// Resolver implementation
const resolvers = {
  Query: {
    searchMovies: (_, { filter }) => filterMovies(movies, filter),
  },
};

// Filter helper functions
const applyStringFilter = (value, filter) => {
  if (!filter) return true;
  if (filter.eq !== undefined) return value === filter.eq;
  if (filter.contains !== undefined) return value.includes(filter.contains);
  return true;
};

const applyIntFilter = (value, filter) => {
  if (!filter) return true;
  if (filter.eq !== undefined) return value === filter.eq;
  if (filter.gt !== undefined) return value > filter.gt;
  if (filter.lt !== undefined) return value < filter.lt;
  return true;
};

const applyFilter = (movie, filter) => {
  if (!filter) return true;

  if (filter.and) return filter.and.every(f => applyFilter(movie, f));
  if (filter.or) return filter.or.some(f => applyFilter(movie, f));
  if (filter.not) return !applyFilter(movie, filter.not);

  return Object.entries(filter).every(([field, condition]) => {
    switch (field) {
      case 'title':
      case 'director':
        return applyStringFilter(movie[field], condition);
      case 'year':
        return applyIntFilter(movie[field], condition);
      default:
        return true;
    }
  });
};

const filterMovies = (movies, filter) => 
  filter ? movies.filter(movie => applyFilter(movie, filter)) : movies;

export  { movies,typeDefs, resolvers};