import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {  getJobs,countJobs } from './db/jobs.js'
import { getCompany, createCompanyLoader } from "./db/company.js";
import DataLoader from "dataloader";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import {LoggingDataSource} from "./LoggingDataSource.js"

const gateway = new ApolloGateway (
    {

      supergraphSdl: new IntrospectAndCompose(

        {
          subgraphs: [
            { name: 'jobs', url: 'http://localhost:9000' },
            { name: 'companies', url: 'http://localhost:9001' },
          ]
        }
      )
      , buildService({ name, url }) {
        return new LoggingDataSource({ url });
      }
}
);

//ref: https://www.apollographql.com/docs/federation/v1/gateway#composing-subgraphs-with-introspectandcompose
const server= new ApolloServer(

  { gateway, subscriptions:false

   }
);
const info= await startStandaloneServer(server,{listen:{ port:9002 }, 
    context: async ({ req, res }) => ({
   // authScope: getScope(req.headers.authorization),
    
      //  companyLoader:createCompanyLoader()
    
  })

});
console.log(`Server running at ${info.url}`);