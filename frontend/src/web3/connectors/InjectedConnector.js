import Connector from "./Connecter";
import {providers} from 'ethers';
import Web3 from 'web3';

export default class InjectedConnector extends Connector {
  
  static supportedWallets = ["metamask", "dapper"];

  async canConnectSilently() {
    if (window.ethereum) {
      return window.ethereum && window.ethereum.isConnected();
    }
    else if (window.web3) {
      return await window.web3.eth.getAccounts();
    }
    else {
      return false;
    }
  }
  
  async createWeb3Instance(silent) {
    let web3 = undefined;
    try {
      const { ethereum } = window;
      if (ethereum) {
        window.web3 = undefined;

        web3 = new Web3(ethereum);
      } else {
        const { web3 } = window;
        if (web3 && web3.isConnected()) {
          web3 = new Web3(web3.currentProvider);
        } else {
          throw new Error("Non-Ethereum browser detected. You should consider trying MetaMask!");
        } 
      }
    } catch (e) {
      await this.disconnect();
      throw e;
    }
    return web3;
  }

  createEthersProvider = (_web3) => {
    return new providers.Web3Provider(_web3.currentProvider);
  }

  async initialize(web3, silent) {
    const provider = web3.currentProvider.connection || web3.currentProvider;
    const { ethereum } = window;
    if(ethereum && ethereum.isConnected() && !silent) {
      if (provider.isMetaMask) {
        await ethereum.request({ method: 'eth_requestAccounts' });
      }
      else {
        await ethereum.enable();
      }
    }

    if (provider.isMetaMask) {
      console.log("Subcribing MetaMask listeners");
      // provider.autoRefreshOnNetworkChange = false;
      if(provider.publicConfigStore) {
        provider.publicConfigStore.on('update', this._onMetaMaskUpdate);
      }
      provider.on("accountsChanged", this._onAccountsChange);
      provider.on("chainChanged", this._onChainChange);
      // this.onStateChangeCallback({"wallet" : "metamask"});
    } else if(provider.isDapper) {
      this.onStateChangeCallback({"wallet" : "dapper"});
    }
    this.web3 = web3;
  }

  _onAccountsChange = (newAccounts) => {
    console.log("onAccountChange", newAccounts);
    // const normalizeAccounts = newAccounts.map(acc => acc.toUpperCase())
    // const accounts = Array.from(new Set([...this.accounts, ...normalizeAccounts]));
    // this.accounts = accounts;
    this.addAccounts(newAccounts);
    if(newAccounts.length == 0) {
      this.disconnect();
    } 
    // this.onStateChangeCallback({selectedAccount : newAccounts[0], accounts});
  }

  _onChainChange = (networkId) => {
    this.networkId = networkId;
    console.log("onChainChange")
    this.onStateChangeCallback({networkId : parseInt(networkId)});
    this.disconnect().then(_ => {
      // metamask recommends refreshing the page on network change
      window.location.reload();
    }).catch(e => console.error(e))
  }

  _onMetaMaskUpdate = (obj) => {
    // console.log("MetaMaskUpdate", obj);
    if(!obj.isUnlocked) {
      console.log("MetaMaskUpdate", obj);
      this.disconnect();
    } else {
      // this.onStateChangeCallback({selectedAccount : obj.selectedAddress});
    }
  }

  async disconnect() {
    if(this.web3) {
      const provider = this.web3.currentProvider.connection || this.web3.currentProvider;
      if (provider.isMetaMask) {
        console.log("Removing listener");
        provider.removeListener("accountsChanged", this._onAccountsChange);
        provider.removeListener("chainChanged", this._onChainChange)
        if (provider.publicConfigStore) {
          provider.publicConfigStore.removeListener("update", this._onMetaMaskUpdate);
        }
      }
      this.web3 = undefined;
    }
    await super.disconnect();
  }
}
