#!/usr/bin/env node
import {polyfillConsole, expressServerBootstrap} from "@animocabrands/backend-common_library";
import app from "./app"

polyfillConsole()

expressServerBootstrap(app);

