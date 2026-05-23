import dotenv from 'dotenv';

// load .env
dotenv.config({ quiet: true });

interface Conf {
    port: number,
    prod: boolean
}

// setup environ
const conf: Conf = {
    port: Number(process.env.PORT!) || 3130,
    prod: (process.env.PROD! === '0' ? false : true)
}

export default conf;