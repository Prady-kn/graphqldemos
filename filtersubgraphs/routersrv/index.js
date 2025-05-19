import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'movies', url: 'http://localhost:4001' },
      { name: 'reviews', url: 'http://localhost:4002' }
    ],
    // Optional configuration
    pollIntervalInMs: 5000, // Default 10s
    introspectionHeaders: {
      Authorization: 'Bearer your-token' // If needed
    }
  })
});

const server = new ApolloServer({ gateway });

startStandaloneServer(server, {
  listen: { port: 4000 }
}).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
