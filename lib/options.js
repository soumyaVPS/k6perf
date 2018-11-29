const Env = require('./environment')
//const Config = require('../../config')
const Path = require('path')

/**
 * Load the relevant options for unit tests, combining "test_*" environment
 * variables with the testing defaults.
 * @param {Object.<string,string>} [extraDefaults] Extra defaults (overwrites test defaults)
 * @returns {Object.<string,string>} Aggregated options
 */
exports.loadOptions = function(extraDefaults = {}) {
  //const chain = Config.chain || {}
  const port = process.env.PORT || '3000'

  const defaults = {
    port: port,
    // TODO: Split baseURL into more granular wallet and issuer urls
    //baseURL: `http://localhost:${port}`,
    //clientId: 'test.js',
    //clientSecret: '76doowNfy9iojytl5X0hrEN3g0zXweqWYEZNwiAANGA=',
      baseURL: `https://wallet-stg.trustedkey.com`,
      //clientId: '0cf24443-5eb7-43e0-bda1-817fe741598f',
      //clientSecret: 'WRQntocJzNv0xZN3tvCWc5DdLurwV8Xm_zp9C_b0Qm8',

     //clientId: 'AppId-for-RelyingParty',
      //clientSecret: 'c99482f8308ed45efb3ccd12926faca9',

      //clientId: '937acede-bdd9-4fd9-a4cc-4cdf527de356',
      //clientSecret:'qpEMfJ8rjK5jWGFYEqkuE1fe_N7iTK_rMtKtUlq9q18',
      rootPemPath: Path.join(__dirname, '/../../_certs/tkroot.pem'),
    issuerPemPath: Path.join(__dirname, '/../unit/fixtures/_certs/issuer.pem'),
    //coinbase: chain.coinbase,
    addressK1: '0x9518b4713963472253d2821eb8b7a9d2e854300c',
    //rpcAddress: chain.rpcAddress,
    //rpcPort: chain.rpcPort
  }

  return Env.populateFromPrefix('test', {}, Object.assign(defaults, extraDefaults))
}

