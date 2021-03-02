import { INTERNAL_SERVER_ERROR } from 'http-status';
import { Response, Request } from './api.wrapper';

const catchAsync = (fn: any) => (req: Request, res: Response) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    return res.json({
      status: INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  });
};

export default catchAsync;
