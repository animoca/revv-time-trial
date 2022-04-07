import Connector from "./Connecter";
import Web3 from 'web3';
import {Bitski, AuthenticationStatus} from 'bitski';
import {BitskiCallbackPath} from "./BitskiCallback";
import {providers} from 'ethers';

export default class BitskiConnector extends Connector {

  static supportedWallets = ["bitski"];

  // switchConnector(new Connector({clientId : "be58f3e0-c966-467f-9da8-e711992e07d4", networkName: "rinkeby", callbackUrl : "http://localhost:3000/bitski/callback"}));
  constructor(config) {
    const [protocol, scrap, domain] = window.location.href.split("/");
    const callbackUrlInFull = `${protocol}//${domain}${BitskiCallbackPath}`;
    const {
      networkName, network = networkName || process.env.REACT_APP_BITSKI_ETHEREUM_NETWORK,
      clientId, _clientId = clientId || process.env.REACT_APP_BITSKI_CLIENT_ID,
      callbackUrl, _callbackUrl = callbackUrl || callbackUrlInFull} = config || {};
    super();
    this.config = config;
    this.networkName = network;
    this.bitski = new Bitski(_clientId, _callbackUrl);
  }

  async canConnectSilently() {
    return await this.bitski.getUser()
  }
  
  async createWeb3Instance(silent) {
    console.log("Bitski authStatus", this.bitski.authStatus);
    if(this.bitski.authStatus === AuthenticationStatus.Connected) {
      return new Web3(this._getProvider());
    } else {
      if(!silent) {
        console.log("Trying to login Bitski")
        await this.bitski.signIn();
        return new Web3(this._getProvider());
      } else {
        // return new Web3(this._getProvider());
        throw new Error("Bitski connected failed");
      }
    }
  }

  createEthersProvider = (_web3) => {
    return new providers.JsonRpcProvider(process.env.REACT_APP_DEFAULT_WEB3_PROVIDER);
  }

  _getProvider() {
    let provider = undefined;
    if(this.networkName) {
      provider = this.bitski.getProvider({ networkName: this.networkName});
    } else {
      provider = this.bitski.getProvider({});
    }
    return provider;
  }

  async initialize(web3) {

  }
  
  async disconnect() {
    await this.bitski.signOut();
    await super.disconnect();
  }

}