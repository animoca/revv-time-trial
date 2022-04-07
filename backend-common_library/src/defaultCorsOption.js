import config from "config";
import {CorsHandler} from "./corsHandler";

let DefaultCorsOption = {};
if(config.has("api.access_control")) {
  const access_control = config.get("api.access_control");
  const corsHandler = new CorsHandler(access_control);
  DefaultCorsOption = corsHandler.getCorsOption();
}

export {DefaultCorsOption};