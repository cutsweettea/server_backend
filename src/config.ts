import dotenv from 'dotenv';

// load .env
dotenv.config({ quiet: true });

interface Conf {
    port: number,
    dev: boolean
}

// setup environ
const conf: Conf = {
    port: Number(process.env.PORT!) || 3130,
    dev: (process.env.DEV! === '0' ? false : true)
}

export default conf;