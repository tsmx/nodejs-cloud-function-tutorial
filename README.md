# Secure configuration management for a GCP cloud function in Node.js

> Tutorial on how to create a [GCP cloud function](https://cloud.google.com/functions/docs/concepts/overview) with a secure configuration management using Node.js (ESM) and [secure-config](https://www.npmjs.com/package/@tsmx/secure-config) and [Secret Manager](https://cloud.google.com/secret-manager).

## Secure configuration setup for a cloud function

Like in a traditional app, it's very common that you'll need sensitive configuration data in a GCP cloud function, e.g. a DB username and password. This tutorial shows a proper way of doing so by leveraging managed cloud services and an additional Node.js package. The goals of this setup are

- Encryption an non-exposing of any needed configuration value
- Use of managed GCP services without loosing the capability to run on other platforms (e.g. on a traditional server, Docker, Kubernetes or else) - no vendor lock-in

To achieve this, we'll be using two components for the cloud functions configuration setup:

1. The [secure-config]() package to securely store the complete configuration as an encrypted JSON file. Uses strong encryption and standard JSON, works with nearly any runtime environment.
2. [GCP Secret Manager](https://cloud.google.com/secret-manager) for secure storage and passing of the secure-config master key to the cloud function by using an environment variable.


**More information coming soon...**