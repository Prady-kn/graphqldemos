import DataLoader from 'dataloader';
import { connection } from './connection.js';
import { groupBy, map, mapParallelAsync } from 'rambda';
import { stringify } from 'querystring';

const getCompanyTable = () => connection.table('company');

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

export function createCompanyLoader() {
  return new DataLoader(async (ids) => {
    try{

      const companies = await getCompanyTable().select().whereIn('id', ids);     
      const companygroupById=groupBy(comp=>comp.id)( companies);
   
      return map( id=> companygroupById[id][0])(ids);
    // return ids.map((id) => companies.find((company) => company.id === id));

  } catch (error) {
    console.error(`[Resolver Error]: ${error.message}`);
    throw error; // Re-throw the error so it propagates to the client
  }

  });
}