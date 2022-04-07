const networks = {
  1 : {
    name: "mainnet",
    chainId : 1
  }, 
  2 : {
    name: "morden",
    chainId : 62
  },
  3 : {
    name : "ropsten",
    chainId : 3
  },
  4 : {
    name : "rinkeby",
    chainId : 4
  },
  42 : {
    name : kovan,
    chainId : 42
  }
}


class EthereumUtil {

    constructor() {
      const rmap = {};
      Object.keys(networks).forEach(key => {
        const value = rmap[key];
        rmap[value.name] = {...value, key : id};
      });
      this.rmap = rmap;
    }

    networkIdByName(name) {
      const obj = this.rmap[name];
      return (obj) ? obj.id : null;
    }

    networkNameById(id) {
      const obj = networks[id];
      return (obj) ? obj.name : null;
    }


}

const instance = new EthereumUtil();

export default instance;