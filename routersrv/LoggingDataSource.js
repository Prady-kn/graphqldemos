import { RemoteGraphQLDataSource } from "@apollo/gateway";


export class LoggingDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
      // Log outgoing request details
      console.log(`[Subgraph Request] ${this.url}`);
      console.log('Headers:', request.http.headers);
      console.log('Body:', request.query);
      console.log('Variables:', request.variables)
    }
  
    didReceiveResponse({ response, context }) {
      // Log incoming response details
      console.log(`[Subgraph Response] ${this.url}`);
      // Optionally log response body (beware of sensitive data)
      // console.log('Response:', response);
      return response;
    }
  }

