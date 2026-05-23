import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';
import cookieParser from 'cookie-parser';
import { generateResponse } from './util.ts';

// setup server and middleware
const serv = express();
serv.use(express.json({ limit: '25kb' }));
serv.use(cookieParser(process.env.CKSEC));

// setup routes
const rr = new RouteRegistrar(serv);

async function registerRoutes() {
    await rr.get({
        path: '/cookie',
        defCallbackOpts: {
            callback: (req, res) => {
                return res.status(200).send('yay');
            },
            requiredCookies: ['cookie']
        },
        adminCallbackOpts: {
            callback: (req, res) => {
                return res.status(200).cookie('cookie', 'abc123', {
                    httpOnly: conf.prod,
                    maxAge: 60*60*24,
                    path: '/',
                    secure: conf.prod,
                    signed: true,
                    sameSite: conf.prod ? 'none' : 'lax'
                }).send(generateResponse(true, 'heres ur cookie'));
            }
        }
    });
}

registerRoutes();

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with prod=${conf.prod}`);
    console.log(`registered ${rr.routeCount()} routes`);
});