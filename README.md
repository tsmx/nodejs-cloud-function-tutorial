# Secure configuration management for a GCP cloud function in Node.js

> Tutorial on how to create a [GCP cloud function](https://cloud.google.com/functions/docs/concepts/overview) with a secure configuration management using Node.js (ESM) and [secure-config](https://www.npmjs.com/package/@tsmx/secure-config) and [Secret Manager](https://cloud.google.com/secret-manager).

## Secure configuration setup for a cloud function

Like in a traditional app, it's very common that you'll need sensitive configuration data in a GCP cloud function, e.g. a DB username and password. This tutorial shows a proper way of doing so by leveraging managed cloud services and an additional Node.js package. The goals of this setup are

- Encryption an non-exposing of any needed configuration value
- Use of managed GCP services without loosing the capability to run on other platforms (e.g. on a traditional server, Docker, Kubernetes or else) - no vendor lock-in

To achieve this, we'll be using two components for the cloud functions configuration setup:

1. The [secure-config]() package to securely store the complete configuration as an encrypted JSON file. Uses strong encryption and standard JSON, works with nearly any runtime environment.
2. [GCP Secret Manager](https://cloud.google.com/secret-manager) for secure storage and passing of the secure-config master key to the cloud function by using an environment variable.

## Steps to implement the configuration management in your cloud function

### Install secure-config and create the config files

Install the [secure-config](https://www.npmjs.com/package/@tsmx/secure-config) packge by running:

```bash
npm install @tsmx/secure-config --save
```

Having this, create a `conf` subfolder in your project with the configuration files. In the tutorial we'll create two files, one for local testing purposes without any encrpytion and a production version which will be used in GCP with an encrypted secret.

The unencrypted config file will be `conf/config.json` with the following simple content:

```json
{
  "secret": "secret-config-value"
}
```

To create the encrypted production version I recommend to use the [secure-config-tool](https://www.npmjs.com/package/@tsmx/secure-config-tool). If you don't want to install this tool, refer to the secure-config [documentation](https://tsmx.net/secure-config/#Encrypted_configuration_entries) on how to generate encrypted entries without it.

For simplicity I assume you have secure-config-tool installed an we will use `00000000000000000000000000000000` (32x `0`) as the encryption key. Having this, create the encrypted configuration for production of the cloud function as following...

```bash
cd conf/
export CONFIG_ENCRYPTION_KEY=00000000000000000000000000000000
secure-config-tool create -nh -p "secret" ./config.json > ./config-production.json
```

This will create `config-prodcution.json` in the `conf` directory with an encrypted secret, like so:

```json
{
  "secret": "ENCRYPTED|a2890c023f1eb8c3d66ee816304e4c30|bd8051d2def1721588f469c348ab052269bd1f332809d6e6401abc3c5636299d"
}
```

### Exclude any non-production configuration from upload to GCP

To prevent `gcloud functions deploy` from uploading any configuration except the encrypted production version, add the following lines to the [.cloudignore](https://cloud.google.com/sdk/gcloud/reference/topic/gcloudignore) file in the top level of your project.

```bash
# don't upload non-production configurations
conf/*
!conf/config-production.json
```

**Note:** GCP will by default set `NODE_ENV=production`, see [this article](https://tsmx.net/nodejs-env-vars-in-gcp-cloud-functions-and-app-engine/) for more details on the default env vars. 

Make also sure not to push any sensible data to your GitHub repo by changing `.gitignore` accordingly.

### Using GCP Secret Manager to securely serve the encryption key

When deploying/starting the cloud function, the `secure-config` package will look for a `CONFIG_ENCRYPTION_KEY` environment variable to decrypt and deliver the configuration values.

To securely serve this key to the cloud function, GCP Secret Manager can be used:

- In the GCP console, head over to Secret Manager and create a new secret with name `CONFIG_KEY` and value `00000000000000000000000000000000` (the key we previously used for encryption)
- Make sure that the IAM service-account running your cloud function has the `Secret Manager Secret Accessor` role, add it if necessary.
- Pass on the created secret as the `CONFIG_ENCRYPTION_KEY` environment variable to the cloud fucntion by adding `--set-secrets=CONFIG_ENCRYPTION_KEY=projects/[PROJECT-ID]/secrets/CONFIG_KEY:latest` to `gcloud functions deploy` (see package.json for a complete example call)

That's it. The cloud function will now receive the key and the configuration values can be decrypted.

Too see it in action, simply call the provided [secure-config cloud function](https://europe-west3-tsmx-gcp.cloudfunctions.net/secure-config-function).

## Summary

Following this tutorial we now have a convenient configuration managament for a GCP cloud function. 
- No secret is exposed in the code
- Minimum dependency on the cloud provider with only one environment variable supplied
- Full feature-set of JSON available in the configuration design (structuring, array, etc.)