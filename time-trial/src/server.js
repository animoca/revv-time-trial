/*jshint esversion: 9 */

require("dotenv").config();

import { polyfillConsole, expressServerBootstrap } from '@animocabrands/backend-common_library';
import gameData from "./data/gameData";

async function main() {
    polyfillConsole();

    await gameData.init();
    expressServerBootstrap(require("./app"));
}

main();

