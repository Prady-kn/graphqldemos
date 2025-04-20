import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {  getJobs,countJobs } from './db/jobs.js'
import { getCompany, createCompanyLoader } from "./db/company.js";
import DataLoader from "dataloader";
import { buildFederatedSchema, buildSubgraphSchema } from "@apollo/federation";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { compact } from "rambda";

//ref: https://www.apollographql.com/docs/federation/v1/subgraphs
//ref: https://github.com/graphql-by-example/job-board/blob/2025
const myTypeDefs=`#graphql

type Query{
    jobs(limit: Int, offset: Int): JobSubList   
}

type JobSubList {
  items: [Job!]!
  totalCount: Int!
}

type Job {
  id: ID!
  date: String!
  title: String!
""" 
Its the company the job is posted from
"""
 company: Company!
  description: String
}

type Company @key(fields:"id",  ) {
  id: ID! 
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
  }

//  , company: async (_root, { id }) => {
//     console.log(`company resolver called for ${id}`);
//     const company = await getCompany(id);
//     if (!company) {
//       throw notFoundError('No Company found with id ' + id);
//     }
//     return company;
//   }

},
Job: {
   date:function(job){
    return formatDate(job.createdAt);
   }
   , 
   company: (job)=>{
    return { id:job.companyId, customid:1 }
   }
    // ,company: (job, _args, { companyLoader }) => {
    //   //  console.log(`context: ${companyLoader}`);
    //    // console.log(`Job.company resolver called for ${job.companyId}`);
    //    // const {loaders}=context;
    //     //const {companyLoader}=context;
    //    //   return getCompany(job.companyId);
    //    return companyLoader.load(job.companyId)
    //   }
}

};

function formatDate(dStr){
  return dStr.slice(0,'yyyy-mm-dd'.length);
}

const mergedTypes = mergeTypeDefs([myTypeDefs]);

const server= new ApolloServer(
  { schema:buildSubgraphSchema({typeDefs:mergedTypes,resolvers:myResolvers}) }
  //{ typeDefs:myTypeDefs, resolvers:myResolvers}

);
const info= await startStandaloneServer(server,{listen:{ port:9000 }, 
    context: async ({ req, res }) => ({
   // authScope: getScope(req.headers.authorization),
    
        companyLoader:createCompanyLoader()
    
  })

});
console.log(`Server running at ${info.url}`);