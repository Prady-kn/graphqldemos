import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {  getJobs,countJobs } from './db/jobs.js'
import { getCompany, createCompanyLoader } from "./db/company.js";
import DataLoader from "dataloader";


//ref: https://github.com/graphql-by-example/job-board/blob/2025
const myTypeDefs=`#graphql

type Query{
    greeting: String,
    jobs(limit: Int, offset: Int): JobSubList,
    company(id: ID!): Company
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

type Company {
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


const server= new ApolloServer({ typeDefs:myTypeDefs, resolvers:myResolvers});
const info= await startStandaloneServer(server,{listen:{ port:9000 }, 
    context: async ({ req, res }) => ({
   // authScope: getScope(req.headers.authorization),
    
        companyLoader:createCompanyLoader()
    
  })

});
console.log(`Server running at ${info.url}`);