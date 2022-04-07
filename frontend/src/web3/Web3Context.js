import React, { Component } from 'react'
import Connectors from './connectors';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

const Web3Context = React.createContext();
const Web3Consumer = Web3Context.Consumer;
const walletConnectors = Object.values(Connectors).reduce( (obj, Connector) => {
  Connector.supportedWallets.forEach( (name) => 
    obj[name] = Connector
  );
  return obj;
}, {});

const defaultWalletConnectors = Object.values(Connectors).reduce( (obj, Connector) => {
  Connector.supportedWallets.forEach( (name) => {
      obj[name] = new Connector()
      obj[name].name = name;
    }
  );
  return obj;
}, {});

class Web3Provider extends Component {

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
 
  intialState = {
    web3: null,
    accounts: [],
    networkId : null,
    ready: false,
    selectedAccount : null,
    availableConnectors : Object.keys(defaultWalletConnectors)
  };
  
  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = this.intialState;
  }

  componentDidMount() {
    const {connector} = this.props;
    if(connector) {
      this.setConnector(this.getConnectorByName(connector));
    }
  }

  _wrapConnectorWithCallback(connector) {
    connector.setOnConnected(this.onConnected);
    connector.setOnDisconnected(this.onDisconnected);
    connector.setOnStateChange(this.onStateChange);
    return connector;
  }

  getNetworkType = async (connector = null) => {
    if(connector == null && this.connector) {
      connector = this.connector.name;
    }
    return await this.getConnectorByName(connector).getNetworkType();
  }

  setConnector = (connector) => {
    if(this.connector != connector) {
      if(this.connector) {
        this.connector.disconnect(); // don't wait for this to happen
        this.connector.resetCallbacks();
        this.clearState();
      }
      this.connector = this._wrapConnectorWithCallback(connector);
    }
  }

  getConnectorByName = (name) => {
    return defaultWalletConnectors[name];
  }

  connect = async (options = {}, fn = _ => _) => {
    try {
      const silent = options.silent || false;
      
      // override if the last connection is through walletConnect
      if(this.props.cookies.get("lastConnectorUsed") == "walletConnect") {
        options.connector = "walletConnect"
      }
      console.info(`getting web3 instance with ${options.connector}`);
      const connector = this.getConnectorByName(options.connector);
      if(!connector) {
        throw new Error(`${options.connector} wallet is not supported.`);
      } else if(connector != this.connector) {
        this.setConnector(connector);
      }
      const res =  await this._connect(silent);
      return await fn(res);
    } catch(e) {
      console.error("Connect failed", e);
    }
  }

  disconnect = async() => {
    try {
      await this.connector.disconnect();
    } catch(e) {
      console.error("Connect failed", e);
    }
  }

  sign = async (message, connector) => {
    const res = await this.connect({connector});
    const {web3, selectedAccount} = res;
    const signature = await web3.eth.personal.sign(message, selectedAccount, undefined);
    return {signature, ...res};
  }

  _connect = async (silent) => {
    if (!this.state.ready) {
      if(!this.connector) {
        this.setConnector(this.recommendConnector());
      }
      const res = await this.connector.connect(silent);
      this.props.cookies.set("lastConnectorUsed", this.connector.name, {maxAge : 86400, path: '/'});
      return res;
    } else {
      return this.state;
    }
  }

  onDisconnected = async (error) => {
    this.setState({...this.intialState, error, ready: false});
    this.props.cookies.remove("lastConnectorUsed")
  }
  
  onConnected = async (res) => {
    console.log("onConnected", res);
    this.setState({...res, ready: true});
  }

  onStateChange = async (state) => {
    console.log("State Change", state);
    this.setState({...this.state, ...state});
  }

  clearState = () => {
    this.state = this.intialState;
    this.setState(this.intialState);
  }

  web3Manager = null;

  render() {
    return (
      <Web3Context.Provider value={{...this.state, 
        connect : this.connect,
        disconnect : this.disconnect,
        getNetworkType : this.getNetworkType,
        sign: this.sign
      }}>
        {this.props.children}
      </Web3Context.Provider>
    );
  }

}

const Provider = withCookies(Web3Provider);
export { Web3Context, Provider as Web3Provider, Web3Consumer };