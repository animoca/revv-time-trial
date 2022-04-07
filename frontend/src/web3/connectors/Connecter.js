import assert from 'assert';


const defaultCallback = () => {
  console.error("Callback not implemented");
};

class Connector {

  networkId = undefined;
  accounts = [];
  onConnectedCallback = defaultCallback;
  onDisconnectedCallback = defaultCallback;
  onStateChangeCallback = defaultCallback;
  name = this.constructor.name;
  connectProm = null;

  async canConnectSilently() {
    return true;
  }

  async getNetworkType() {
    const web3 = await this.getWeb3Instance(true);
    return await web3.eth.net.getNetworkType();
  }

  async getWeb3Instance(silent) {
    if(!this.web3) {
      const web3 = await this.createWeb3Instance(silent);
      this.web3 = web3;
    }
    return this.web3;
  }

  getEthersProvider(_web3) {
    return this.createEthersProvider(_web3);
  }

  async createWeb3Instance() {
    assert(true, "createWeb3Instance function should be implemented")
  }

  async initialize() {
    assert(true, "initialize function should be implemented")
  }

  setOnConnected(fn) {
    this.onConnectedCallback = fn;
  }

  setOnDisconnected(fn) {
    this.onDisconnectedCallback = fn;
  }

  setOnStateChange(fn) {
    this.onStateChangeCallback = fn;
  }

  resetCallbacks() {
    this.onConnectedCallback = defaultCallback; 
    this.onDisconnectedCallback = defaultCallback;
    this.onStateChangeCallback = defaultCallback;
  }

  connectPromErrorHandler(e) {
    console.error(e);
    this.connectProm = null;
  }

  async connect(silent = false) {
    if(this.connectProm) {
      return this.connectProm;
    } else {
      this.connectProm = this._connect(silent);
      this.connectProm.catch(this.connectPromErrorHandler.bind(this));
      return this.connectProm;
    }
  }

  async _connect(silent = false) {
    if(this.connecting) {
      throw new Error("Connecting in progress.");
    }
    if(!silent || this.canConnectSilently()) {
      try {
        this.connecting = true;
        this.onStateChangeCallback({connecting : true});
        const web3 = await this.getWeb3Instance(silent);
        const ethersProvider = this.getEthersProvider(web3);
        // if(window) {
        //   /*
        //   this is temp hack, when connecting with multiple wallet at the same time hence in connect page, 
        //   there are chances where the user refuse to sign messages which leads to the current windows.web3 is overwritten.
        //   */
        //   window.userWeb3 = web3;
        // }
        this.web3 = web3;
        await this.initialize(web3);
        console.info(`Connector ${this.name} Initialized`);
        const networkId = await this.getNetwork(web3);
        const accounts = await this.getAccounts(web3);
        console.info(`Connector ${this.name} accounts`, accounts, "network id", networkId);
        const selectedAccount = accounts[0];
        const walletProvider = this.name;
        const res = {web3, selectedAccount, accounts, networkId, walletProvider, ethersProvider};
        if(accounts.length === 0) {
          await this.disconnect();
          throw new Error("No account from getAccount");
        }
        this.onConnectedCallback(res);
        return res;
      } finally {
        this.connecting = false;
        this.onStateChangeCallback({connecting : false});
      }
    }
  }

  async disconnect() {
    console.log(`${this.name} Disconnected`);
    this.networkId = undefined;
    this.accounts = [];
    this.connectProm = null;
    this.onDisconnectedCallback();
    // this.onConnectedCallback = defaultCallback;
    // this.onDisconnectedCallback = defaultCallback;
    // this.onStateChangeCallback = defaultCallback;
  }

  async getNetwork(web3) {
    this.networkId = await web3.eth.net.getId();
    return this.networkId
  }

  async addAccounts(accounts, web3) {
    // const normalizeAccounts = (accounts.map(acc => web3.utils.toChecksumAddress(acc).replace("X", "x")));
    const normalizeAccounts = accounts;
    this.accounts = Array.from(new Set([...this.accounts, ...normalizeAccounts]));
  }

  async getAccounts(web3) {
    // const normalizeAccounts = (await web3.eth.getAccounts()).map(acc => {
    //     return web3.utils.toChecksumAddress(acc).replace("X", "x");
    // });
    const normalizeAccounts = (await web3.eth.getAccounts());
    this.accounts = Array.from(new Set([...this.accounts, ...normalizeAccounts]));
    return this.accounts;
  }

  async getSelectedAccount(web3) {
    let selectedAccount = this.selectedAccount;
    if(!selectedAccount) {
      const accounts = await this.getAccounts(web3);
      selectedAccount = accounts[0];
      console.log("Selected Account", selectedAccount);
    }
    return selectedAccount;
  }
}

export default Connector;
