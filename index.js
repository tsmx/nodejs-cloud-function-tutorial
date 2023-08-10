import secureConfig from '@tsmx/secure-config';
const config = secureConfig();

export const helloGCP = (req, res) => {
    res.json({
        info: 'Hello from GCP cloud functions!',
        nodeEnv: process.env.NODE_ENV,
        secret: config.secret
    });
}