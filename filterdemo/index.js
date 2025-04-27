
//import { typeDefs, resolvers } from './inmemrepository.js'
import { typeDefs, resolvers } from './cosmosrepo.js'
import {ApolloServer} from 'apollo-server'

// Server setup
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});