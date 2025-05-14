import {ApolloServer} from 'apollo-server'

const typeDefs= `#graphql

union Member = Employee | Inspector

interface Person {
  name: String!
  age: Int!
}

type Employee implements Person {
  name: String!
  age: Int!
  employeeNumber: String!
}

type Inspector implements Person {
  name: String!
  age: Int!
  designation: String!
}

type Query {
  members: [Person!]!
  unionmembers: [Member!]!
}
`;

// Sample data
const members = [
    {
      __typename: 'Employee',
      name: 'Alice',
      age: 30,
      employeeNumber: 'E123'
    },
    {
      __typename: 'Inspector',
      name: 'Bob',
      age: 45,
      designation: 'Safety Officer'
    }
  ];

const resolvers = {
    Query: {
      members: () => members,
      unionmembers: ()=>members
    },
    
    Person: {
      __resolveType: (parent) => parent.__typename
    },
    
    Employee: {
      name: (parent) => parent.name,
      age: (parent) => parent.age,
      employeeNumber: (parent) => parent.employeeNumber
    },
    
    Inspector: {
      name: (parent) => parent.name,
      age: (parent) => parent.age,
      designation: (parent) => parent.designation
    }
  };


// Server setup
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
