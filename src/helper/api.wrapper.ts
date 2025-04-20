/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import Route from 'route-parser';
import qs from 'qs';
import { TokenPayload } from './auth.helper'

export interface Response extends ServerResponse {
  send: (response: string | object) => void;
  json: (response: any) => void;
  status: (code: number) => this;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export interface Request extends IncomingMessage {
  params: any;
  query: any;
  body: any;
  originalUrl: string;
  path: string;
  user: TokenPayload;
}

export type NextFunction = (err?: any) => void;
export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction, err?: Error,) => void;
export type RouteHandler = (req: Request, res: Response, next?: NextFunction) => any;

interface RouteConfig {
  method: string;
  url: any;
  handler: RouteHandler;
  middlewares: MiddlewareFunction[];
}

class APIWrapper {
  routes: RouteConfig[];
  globalMiddlewares: MiddlewareFunction[];

  /**
   * @constructor
   * @description initialize the route array and global middlewares
   */
  constructor() {
    this.routes = [];
    this.globalMiddlewares = [];
  }

  /**
   * Add middleware to be executed for all routes
   * @param middleware
   */
  use(middleware: MiddlewareFunction): APIWrapper {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  /**
   * add route to the route array list
   * @param method
   * @param url
   * @param middlewares
   * @param handler
   */
  private addToRoute(
    method: string,
    url: string,
    middlewares: MiddlewareFunction[],
    handler: RouteHandler
  ): void {
    this.routes.push({
      method,
      url: new Route(url),
      handler,
      middlewares
    });
  }

  /**
   * check if the url is in the route list array
   * @param method HTTP method
   * @param url
   */
  private findRoute(method: string, url: string) {
    // Extract the path part without query parameters
    const path = url.split('?')[0];

    const route = this.routes.find((r) => {
      return r.method === method && r.url.match(path);
    });

    if (!route) return null;

    return {
      handler: route.handler,
      middlewares: route.middlewares,
      params: route.url.match(path),
      query: qs.parse(url.split('?')[1]),
      path
    };
  }

  /**
   * Execute middleware chain
   */
  private executeMiddlewares(
    req: Request,
    res: Response,
    middlewares: MiddlewareFunction[],
    index: number,
    callback: () => void
  ) {
    // If we've gone through all middlewares, call the callback
    if (index >= middlewares.length) {
      return callback();
    }

    const middleware = middlewares[index];

    // Execute current middleware and wait for next() to be called
    middleware(req, res, (err) => {
      // If error occurred, skip to the final callback
      if (err) {
        return callback();
      }

      // Otherwise proceed to next middleware
      this.executeMiddlewares(req, res, middlewares, index + 1, callback);
    });
  }

  /**
   * server instance and routing logic
   */
  server() {
    return createServer(async (req, res) => {
      const method = req.method || 'GET';
      const url = req.url || '/';
      console.log(`${method} ${url}`);

      // Initialize request and response objects
      const enhancedReq = req as Request;
      const enhancedRes = res as Response;

      // Add properties to request
      enhancedReq.originalUrl = url;
      enhancedReq.path = url.split('?')[0];

      // Set up CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Max-Age', '2592000');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Handle OPTIONS request for CORS preflight
      if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Check if the route exists
      const found = this.findRoute(method, url);

      if (found) {
        // Add route parameters to request
        enhancedReq.params = found.params;
        enhancedReq.query = found.query;

        // Parse request body
        await new Promise((resolve) => {
          let data = '';
          req.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });

          req.on('end', () => {
            try {
              enhancedReq.body = data ? JSON.parse(data) : {};
            } catch (e) {
              enhancedReq.body = data || {};
            }
            resolve(true);
          });
        });

        // Enhance response object with Express-like methods
        enhancedRes.status = function (code: number) {
          this.statusCode = code;
          return this;
        };

        enhancedRes.send = function (content: string | object) {
          if (typeof content === 'string') {
            this.setHeader('Content-Type', 'text/plain');
            this.end(content);
          } else {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(content));
          }
          return this;
        };

        enhancedRes.json = function (content: any) {
          this.setHeader('Content-Type', 'application/json');
          if (!this.statusCode) {
            this.statusCode = 200;
          }
          this.end(JSON.stringify(content));
          return this;
        };

        enhancedRes.setHeader = function (name: string, value: string | number | readonly string[]) {
          ServerResponse.prototype.setHeader.call(this, name, value);
          return this;
        };

        // Combine global and route-specific middlewares
        const allMiddlewares = [...this.globalMiddlewares, ...found.middlewares];

        // Execute middleware chain
        this.executeMiddlewares(enhancedReq, enhancedRes, allMiddlewares, 0, () => {
          // After all middlewares, execute the route handler
          try {
            found.handler(enhancedReq, enhancedRes);
          } catch (error) {
            console.error('Route handler error:', error);
            enhancedRes.status(500).json({
              status: 500,
              message: 'Internal Server Error',
              error: error instanceof Error ? error.message : String(error)
            });
          }
        });

        return;
      }

      // Route not found
      res.writeHead(404);
      res.end(JSON.stringify({ status: 404, message: 'Route not found.' }));
    });
  }

  /**
   * Start the server on the particular port
   * @param port port to run the app
   * @param cb the callback function
   */
  listen(port: number | string, cb?: () => void) {
    const server = this.server();
    server.listen(port, cb);
    return server;
  }

  Router() {
    const methods = {
      // Route handlers with middleware support
      get: (url: string, ...handlers: (MiddlewareFunction | RouteHandler)[]) => {
        const handler = handlers.pop() as RouteHandler;
        const middlewares = handlers as MiddlewareFunction[];
        return this.addToRoute('GET', url, middlewares, handler);
      },

      post: (url: string, ...handlers: (MiddlewareFunction | RouteHandler)[]) => {
        const handler = handlers.pop() as RouteHandler;
        const middlewares = handlers as MiddlewareFunction[];
        return this.addToRoute('POST', url, middlewares, handler);
      },

      put: (url: string, ...handlers: (MiddlewareFunction | RouteHandler)[]) => {
        const handler = handlers.pop() as RouteHandler;
        const middlewares = handlers as MiddlewareFunction[];
        return this.addToRoute('PUT', url, middlewares, handler);
      },

      patch: (url: string, ...handlers: (MiddlewareFunction | RouteHandler)[]) => {
        const handler = handlers.pop() as RouteHandler;
        const middlewares = handlers as MiddlewareFunction[];
        return this.addToRoute('PATCH', url, middlewares, handler);
      },

      delete: (url: string, ...handlers: (MiddlewareFunction | RouteHandler)[]) => {
        const handler = handlers.pop() as RouteHandler;
        const middlewares = handlers as MiddlewareFunction[];
        return this.addToRoute('DELETE', url, middlewares, handler);
      }
    };

    return methods;
  }
}

export default new APIWrapper();
