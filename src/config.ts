import dotenv from 'dotenv';

dotenv.config({ quiet: true });

interface Conf {
    port: number,
    dev: boolean
}

const conf: Conf = {
    port: Number(process.env.PORT!) || 3130,
    dev: (process.env.DEV! === '0' ? false : true)
}

export default conf;