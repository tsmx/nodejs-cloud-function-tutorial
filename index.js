export const helloGCP = (req, res) => {
    res.send('Hello from GCP cloud functions! (CONFIG_KEY: ' + process.env.CONFIG_KEY + ')');
}