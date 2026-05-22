import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';
import { RequestType } from './routes/registrar.ts';

// setup server and routes
const serv = express();
const rr = new RouteRegistrar(serv);

rr.register('/register', RequestType.POST, (req, res) => {
    return res.status(200).send('hey!');
}, (req, res) => {
    return res.status(400).send('nah');
});

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with dev=${conf.dev}`);
})