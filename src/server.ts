import { IncomingMessage, ServerResponse } from 'http';
import apiWrapper from './helper/api.wrapper';
import { Response, Request } from './helper/api.wrapper';

const PORT = process.env.PORT || 3001;

const app = apiWrapper.Router();
app.get('/', async (req: IncomingMessage, res: Response) => res.send('<h1>Hello There</h1>'));
app.get('/full-name/:firstname/:lastname', async (req: Request, res: Response) => {
     const { params: { firstname, lastname }, query } = req;
     res.send(`Hello ${ firstname }, ${ lastname },${ JSON.stringify(query) }`);
    });


app.listen(PORT, async () => console.log(`App running on port ${PORT}`));
