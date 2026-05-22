import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';

const serv = express();

const rr = new RouteRegistrar(serv);

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with dev=${conf.dev}`);
})