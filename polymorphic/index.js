import {ApolloServer} from 'apollo-server'
import { GraphQLJSON } from 'graphql-type-json';

const typeDefs= `#graphql

scalar JSON

type Parameter {
  name: String!
  type: String!
  value: JSON!  # JSON fragment here
}

union Member = Employee | Inspector

interface Person {
  name: String!
  age: Int!
  children: [Person!]
}

type Employee implements Person {
  name: String!
  age: Int!
  employeeNumber: String!
  children: [Person!]
}

type Inspector implements Person {
  name: String!
  age: Int!
  designation: String!
  children: [Person!]
}

type Query {
  members: [Person!]!
  unionmembers: [Member!]!
  parameters: [Parameter!]!
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
    },
    {
        "type": "Employee",
        "name": "Alice",
        "age": 35,
        "employeeNumber": "E456",
        "children": [
          {
            "type": "Inspector",
            "name": "Charlie",
            "age": 10,
            "designation": "Junior Safety"
          }
        ]
      }
  ];

const resolvers = {
    JSON: GraphQLJSON,
    Query: {
      members: () => members,
      unionmembers: ()=>members,
      parameters: () => [
      {
        name: "retries",
        type: "Integer",
        value: 3  // Will be serialized as JSON
      },
      {
        name: "features",
        type: "Array", 
        value: [ { "retries": 3 },
            { "features": [{ "darkMode": false }] }]  // Nested JSON
      }
    ]

    },

    Member: {
        __resolveType: (parent) => parent.__typename || parent.type,
       // children: (parent) => parent.children || []
      },
    
    Person: {
      __resolveType: (parent) => parent.__typename || parent.type,
      children: (parent) => parent.children || []
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
