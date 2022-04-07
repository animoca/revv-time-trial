import {expressServerBootstrap, polyfillConsole} from '@animocabrands/backend-common_library';
import app from "./app";

polyfillConsole();
expressServerBootstrap(app);