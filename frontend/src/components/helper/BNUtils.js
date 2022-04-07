import {toBN} from 'web3-utils'

//Max BN number 2**256 - 1 
const MAX_256_BIT_VALUE = toBN(2).pow(toBN(256)).sub(toBN(1)); 

export { MAX_256_BIT_VALUE }