import { createServer, ServerResponse, IncomingMessage } from 'http';
import Route from 'route-parser';
import qs from 'qs';

export interface Response extends ServerResponse {
  send: (response: string) => void;
  json: (response: any) => void;
}

export interface Request extends IncomingMessage {
  params: any;
  query: any;
}

class APIWrapper {
  routes: { method: string, url: any, handler: (req: Request, res: Response) => any }[];
  constructor() {
    this.routes = [];
  }
  // adding route to array
  private addToRoute(method: string, url: string, handler: (req: Request, res: Response) => any): void {
    this.routes.push({ method, url: new Route(url), handler });
  }
 
  // fetching from the array
  private findRoute(method: string, url: string) {
    const route = this.routes.find(r => r.method === method && r.url.match(url))
    if (!route) return null;
    return { handler: route.handler, params: route.url.match(url), query: qs.parse(url.split('?')[1]) };
  }

  Router() {
    // GET request handler
    const get = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('GET', url, handler);
    }

    // POST request handler
    const post = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('POST', url, handler);
    }

    // PUT request handler
    const put = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('PUT', url, handler);
    }

    // PATCH request handler
    const patch = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('PATCH', url, handler);
    }

    // DELETE request handler
    const del = (url: string, handler: (req: Request, res: Response) => any) => {
      return this.addToRoute('DELETE', url, handler);
    }

    const listen = (port: number | string, cb: () => {}) => {
      createServer((req, res) => {
        const method = req.method;
        const url = req.url;

        // check if the route is present
        const found = this.findRoute(method as string, url as string);

        if (found) {
          // @ts-ignore
          req.params = found.params;
          // @ts-ignore
          req.query = found.query;
          // @ts-ignore
          res.send = (content: any) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(content);
          };

          // @ts-ignore
          res.json = (content: any) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
          }
          return found.handler(req as any, res as any);
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route not found.');
      }).listen(port, cb);
    }

    return { get, post, patch, put, delete: del, listen }
  }
}

export default new APIWrapper();