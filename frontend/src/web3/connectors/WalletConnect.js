import Connector from './Connecter';
import Web3 from 'web3';
import { providers } from 'ethers';
import {logout} from "../../services/httpService";
import WalletConnectProvider from "@walletconnect/web3-provider";

export default class WalletConnect extends Connector {
    constructor() {
        super();

        this.wcProvider = new WalletConnectProvider({
            // infuraId: process.env.REACT_APP_INFURA_ID,
            rpc: {
                4: process.env.REACT_APP_DEFAULT_WEB3_PROVIDER,
                1: process.env.REACT_APP_DEFAULT_WEB3_PROVIDER
            },
            chainId: process.env.REACT_APP_CHAIN_ID
        })
    }

    static supportedWallets = ["walletConnect"];
    

    async getWeb3Instance() {
        return new Web3(this.wcProvider)
    }

    createEthersProvider = (_web3) => {
        return new providers.JsonRpcProvider(process.env.REACT_APP_DEFAULT_WEB3_PROVIDER);
    }

    _accountsChanged = (accounts) => {
        // console.log("walletConnect", accounts);
        this.addAccounts(accounts);
    }

    _disconnect = (code, reason) => {
        this.disconnect();
    }

    async initialize(web3) {
        this.wcProvider.onConnect(() => {
        });
        
        // Subscribe to accounts change
        this.wcProvider.on("accountsChanged", this._accountsChanged);
        
        // Subscribe to chainId change
        // this.wcProvider.on("chainChanged", (chainId) => {
        //     console.log(chainId);
        // });
        
        // Subscribe to session disconnection
        this.wcProvider.on("disconnect", this._disconnect);

        try {
            await this.wcProvider.enable()
            this.web3 = await this.getWeb3Instance()
        } catch(e) {
            // user closed modal, we cannot bring the modal back up again
            // this is a bug and it is not fixed
            // only option is to refresh the page but thats bad UI
            // https://github.com/WalletConnect/walletconnect-monorepo/issues/243
            window.location.reload()
        }
    }

    async disconnect() {
        await logout();
        this.wcProvider.off("accountsChanged", this._accountsChanged)
        this.wcProvider.off("disconnect", this._disconnect)
        await this.wcProvider.wc.killSession();
        this.wcProvider.disconnect();
        await super.disconnect();

        window.location.reload()
    }
}
