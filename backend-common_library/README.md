# Common Library

## Version 1.1.0
### Breaking Changes 

* `import winston from 'winston';` will not work anymore, switch to `console.log`
* winston transport can be updated thru environment variable `LOG_TRANSPORT` available values includes `file`, `console`, `colorConsole` (defaults to `console`)
* switch from node-cleanup to async-exit-hook for shutdown hook.
  ``` javascript
    import {asyncShutdownHook} from "@animocabrands/backend-common_library";

    asyncShutdownHook(async () => {
      await .....
    });
  ```


## To link the workspace locally start development.
`yarn link`
`yarn start`

 *To linked package as an dependency `yarn link @animocabrands/backend-common_library`*

## example configuration

```json
{
  "mongodb": {
    // mongo url
    "url": "mongodb://f1_user:f1_password@localhost:27017/f1?authSource=admin"
  },
  "redis": {
    // redis url
    "url": "redis://anonymous:password@localhost"
  },
  "api": {
    // cors configuration
    "access_control": [
      {
        "regex": "http[s]?:\/\/localhost:[0-9]{4}"
      }
    ],
    // salt for the sessionId
    "secret": "dev"
  }
}
```