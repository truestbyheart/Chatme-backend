/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import Route from 'route-parser';
import qs from 'qs';

export interface Response extends ServerResponse {
  send: (response: string) => void;
  json: (response: any) => void;
}

export interface Request extends IncomingMessage {
  params: any;
  query: any;
  body: any;
}

class APIWrapper {
  routes: { method: string; url: any; handler: (req: Request, res: Response) => any }[];

  /**
   * @constructor
   * @description initialize the route array
   */
  constructor() {
    this.routes = [];
  }

  /**
   * add route to the route array list
   * @param method
   * @param url
   * @param handler
   */
  private addToRoute(method: string, url: string, handler: (req: Request, res: Response) => any): void {
    this.routes.push({ method, url: new Route(url), handler });
  }

  /**
   * check if the url is in the route list array
   * @param method HTTP method
   * @param url
   */
  private findRoute(method: string, url: string) {
    const route = this.routes.find((r) => r.method === method && r.url.match(url));
    if (!route) return null;
    return { handler: route.handler, params: route.url.match(url), query: qs.parse(url.split('?')[1]) };
  }

  /**
   * server instance and routing logic
   */
  server() {
    return createServer(async (req, res) => {
      const method = req.method;
      const url = req.url;

      // check if the route is present
      const found = this.findRoute(method as string, url as string);
      // setting up cors
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Max-Age', 2592000);
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (found) {
        // @ts-ignore
        req.params = found.params;
        // @ts-ignore
        req.query = found.query;

        // body-parser
        await new Promise((resolve, _reject) => {
          let data = '';
          req.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });

          req.on('end', () => {
            // @ts-ignore
            req.body = data ? JSON.parse(data) : null;
            resolve(true);
          });
        });

        // @ts-ignore
        res.send = (content: any) => {
          res.setHeader('content-type', 'text/plain');
          res.write(content);
          return res.end();
        };

        // @ts-ignore
        res.json = (content: any) => {
          res.setHeader('content-type', 'application/json');
          // res.statusCode = content.status | 200;
          res.writeHead(content.status || 200);
          res.write(JSON.stringify(content));
          return res.end();
        };
        return found.handler(req as any, res as any);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Route not found.');
    });
  }

  /**
   * Start the server on the particular port
   * @param port port to run the app
   * @param cb the calstringl back function
   */
  listen(port: number | string, cb: () => void) {
    this.server().listen(port, cb);
  }

  Router() {
    // GET request handler
    const get = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('GET', url, handler);
    };

    // POST request handler
    const post = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('POST', url, handler);
    };

    // PUT request handler
    const put = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('PUT', url, handler);
    };

    // PATCH request handler
    const patch = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('PATCH', url, handler);
    };

    // DELETE request handler
    const del = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('DELETE', url, handler);
    };

    return { get, post, patch, put, delete: del };
  }
}

export default new APIWrapper();
