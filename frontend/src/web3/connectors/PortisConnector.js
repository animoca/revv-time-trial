import Connector from "./Connecter";
import Web3 from 'web3';
import Portis from '@portis/web3';
import {providers} from 'ethers';

export default class PortisConnector extends Connector {

  static supportedWallets = ["portis"];

  constructor(config) {
    const {
      networkName, network = networkName || process.env.REACT_APP_PORTIS_ETHEREUM_NETWORK
    } = config || {};
    super();
    this.config = config;
    this.networkName = network;
  }

  getPortis() {
    if(!this.portis) {
      const {
        networkName, network = networkName || process.env.REACT_APP_PORTIS_ETHEREUM_NETWORK ,
        apiKey, _apiKey = apiKey || process.env.REACT_APP_PORTIS_API_KEY,
        options
      } = this.config || {};
      this.portis = new Portis(_apiKey, network, options);
    }
    return this.portis;
  }

  async getWeb3Instance(silent) {
    const web3 = new Web3(this.getPortis().provider);
    return web3;
  }

  createEthersProvider = (_web3) => {
    return new providers.Web3Provider(_web3.currentProvider);
  }

  async initialize(web3) {
    const portis = this.getPortis();
    portis.onLogin((address, email, reputation) => {
      if(address) {
        this.addAccounts([address], web3);
      }
      if(email || reputation){
        this.onStateChangeCallback({portis : {email, reputation}});
      }
    });
    portis.onLogout(() => {
      this.disconnect();
    });

  }
  
  async disconnect() {
    await super.disconnect();
  }

  async autoLoginComplete() {
    // this.getPortis().showPortis();
  }

}