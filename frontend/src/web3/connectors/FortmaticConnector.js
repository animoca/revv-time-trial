import Connector from "./Connecter";
import Web3 from 'web3';
import Fortmatic from 'fortmatic';
import {providers} from 'ethers';

export default class FortmaticConnector extends Connector {

  static supportedWallets = ["fortmatic"];

  constructor(config) {
    const {
      apiKey, _apiKey = apiKey || process.env.REACT_APP_FORTMATIC_API_KEY,
      options
    } = config || {};
    super();
    this.options = options || {};
    this.fortmatic = new Fortmatic(_apiKey);
  }

  async createWeb3Instance(silent) {
    const web3 = new Web3(this.fortmatic.getProvider());
    if(!silent && await this.fortmatic.user.isLoggedIn()) {
      // console.log("NOSIY Login")
      const res = await this.fortmatic.user.login();
    }
    return web3;
  }

  createEthersProvider = (_web3) => {
    return new providers.Web3Provider(_web3.currentProvider);
  }

  async initialize(web3) {
    
  }
  
  async disconnect() {
    if(this.options.autoLogoutOnDisconnect) {
      await this.fortmatic.user.logout();
    } 
    await super.disconnect();
  }


}