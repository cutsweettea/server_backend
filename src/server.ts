import express from 'express';
import RouteRegistrar from './routes/registrar.ts';
import conf from './config.ts';
import { RequestType } from './routes/registrar.ts';
import { generateResponse } from './util.ts';

// setup server and middleware
const serv = express();
serv.use(express.json({ limit: '25kb' }));

// setup routes
const rr = new RouteRegistrar(serv);

rr.register('/register', RequestType.POST, {
    callback: (req, res) => {
        return res.status(200).send(generateResponse(true, 'hi'));
    }
}, {
    callback: (req, res) => {
        return res.status(400).send(generateResponse(false, 'no'));
    },
    requiredBodyValues: ['sid']
});

serv.listen(conf.port, () => {
    console.log(`listening on port ${conf.port} with dev=${conf.dev}`);
})