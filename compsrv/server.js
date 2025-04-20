import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {  getJobs,countJobs } from './db/jobs.js'
import { getCompany, createCompanyLoader } from "./db/company.js";
import DataLoader from "dataloader";
import { buildSubgraphSchema } from "@apollo/federation";
import { mergeTypeDefs } from "@graphql-tools/merge";


//ref: https://github.com/graphql-by-example/job-board/blob/2025
const myTypeDefs=`#graphql

type Query{   
    company(id: ID!): Company
}


type Company @key(fields:"id") {
  id: ID!
  name: String!
  description: String
 # jobs: [Job!]!
}

`;

//const companyLoader = createCompanyLoader();

const myResolvers = {

Query:{
greeting: ()=> "Hello world",
jobs:async (_root, { limit, offset }) => {
    const items = await getJobs(limit, offset);
    const totalCount = await countJobs();
    return { items, totalCount };
  },

  company: async (_root, { id }) => {
    console.log(`company resolver called for ${id}`);
    const company = await getCompany(id);
    if (!company) {
      throw notFoundError('No Company found with id ' + id);
    }
    return company;
  }

},
Company:{
   __resolveReference(comp,{ companyLoader }){
   return companyLoader.load(comp.id);
   // return await getCompany(comp.id);
  }
},
Job: {
   date:function(job){
    return formatDate(job.createdAt);
   },
    company: (job, _args, { companyLoader }) => {
      //  console.log(`context: ${companyLoader}`);
       // console.log(`Job.company resolver called for ${job.companyId}`);
       // const {loaders}=context;
        //const {companyLoader}=context;
       //   return getCompany(job.companyId);
       return companyLoader.load(job.companyId)
      }
}

};

function formatDate(dStr){
  return dStr.slice(0,'yyyy-mm-dd'.length);
}

const mergedTypes = mergeTypeDefs([myTypeDefs]);

const server= new ApolloServer(
{ schema: buildSubgraphSchema({typeDefs:mergedTypes, resolvers:myResolvers}) }
//  { typeDefs:myTypeDefs, resolvers:myResolvers}

);
const info= await startStandaloneServer(server,{listen:{ port:9001 }, 
    context: async ({ req, res }) => ({
   // authScope: getScope(req.headers.authorization),
    
        companyLoader:createCompanyLoader()
    
  })

});
console.log(`Server running at ${info.url}`);