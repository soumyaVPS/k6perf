const ChildProcess = require('child_process')
const WalletUtils = require('./WalletUtils')
const Utils = require('trustedkey-js/utils')
const RP = require('request-promise-native')
const Crypto = require('crypto')
const Assert = require('assert')
const FS = require('fs')
const Asn1js = require('asn1js')
const Pkijs = require('pkijs')

const lib = module.exports

lib.testCSR = function(csr) {
  const child = ChildProcess.spawnSync('openssl', ['req', '-text'], {input: csr, encoding: 'utf-8'})
  Assert.strictEqual(child.output[2], '', child.output[2])
  Assert.strictEqual(child.status, 0, child.output[1])
  return child.output[1]
}
const Logger = require('../../lib/logger')

// TODO: Run child processes in parallel
/**
 *
 * @param {{issuerPemPath:string,rootPemPath:string}} options
 * @param {string} allpems
 * @returns {Utils.Claim[]} parsed claims
 */
lib.testPem = function(options, allpems) {
  Assert.strictEqual(typeof allpems, 'string', 'Expected allpems of type `string`')
  // Replace the newline between two certs with !, then split on !
  const pems = allpems.replace(/-\r?\n-/g, '-!-').split('!')
  Assert(pems.length >= 2, `Expected at least 2 certificates, got ${pems.length}`)
  Logger.info('pems', pems)

  // Last PEM is issuer; ensure it's what we expect
  function normalize(s) {
    return s.trim().replace(/\r\n/g, '\n')
  }
  const issuerPem = normalize(pems[pems.length - 1])
  const issuerPemFile = normalize(FS.readFileSync(options.issuerPemPath).toString())
  Assert.strictEqual(issuerPem, issuerPemFile)

  // Verify each x509 cert and parse
  return pems.map(pem => {
    Assert.ok(pem.length <= 44429, `PEM too large for Android key store: \n${pem}`)
    const args = ['verify', '-CAfile', options.rootPemPath, '-untrusted', options.issuerPemPath]
    // console.warn("openssl", args.join(' '))
    var child = ChildProcess.spawnSync('openssl', args, {input: pem, encoding: 'utf-8'})
    Assert.strictEqual(child.output[2], '', child.output[2])
    Assert.strictEqual(child.status, 0, child.output[1])
    const json = Utils.parsePem(pem)
    Assert.ok(json.serialNo.length < 42 || json.serialNo[2] < '8', 'SerialNo should be positive, not ' + json.serialNo)
    return json
  })
}

lib.getPkijsCert = function(pem) {
  const b64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g, '')
  const der = Buffer.from(b64, 'base64')
  Assert.ok(der.length <= 32768, 'PEM too large for Android keystore')
  const ab = new Uint8Array(der).buffer
  const asn1 = Asn1js.fromBER(ab)
  return new Pkijs.Certificate({schema: asn1.result})
}

lib.waitForReceipt = async function(duration_ms, callback, step_ms = 1000) {
  const done = await callback()
  if (done !== undefined) {
    return done
  }
  if (duration_ms <= 0) {
    throw new Error('timeout')
  }
  await Utils.wait(Math.min(step_ms, duration_ms))
  return lib.waitForReceipt(duration_ms - step_ms, callback, step_ms)
}

lib.HttpClient = function(options) {
  this.pair = WalletUtils.generateKeypair()
  if (typeof options.coinbase !== 'undefined') {
    const digest2 = Crypto.createHash('sha256')
      .update(Buffer.from(options.coinbase.substr(2), 'hex'))
      .update('delegate')
      .digest('hex')
    this.delegatesignature = this.pair.signWithMessageHash(digest2)
  }

  this.options = options
}

lib.HttpClient.prototype.getAuthHeader = function(url, credential, body) {
  const iat = Utils.getUnixTime()
  const exp = iat + 100
  const jwk = Utils.hexToJwk(credential.pubKeyHex)
  const claims = {
    aud: url,
    exp: exp,
    iat: iat,
    body: body ? Utils.sha256(body, 'hex') : null
  }
  const jwt = Utils.createEcdsaJws(claims, credential, {typ: 'JWT'})

  const jose2 = {cty: 'JWT', iss: this.options.clientId, jwk: jwk, exp: exp, iat: iat}
  return 'Bearer ' + Utils.createHmacJws(jwt, this.options.clientSecret, jose2)
}

lib.HttpClient.prototype.get = function(path, credential) {
  credential = credential || this.pair
  const url = this.options.baseURL + path

  const httpOptions = {}
  httpOptions.headers = {
    Authorization: this.getAuthHeader(url, credential)
  }
  httpOptions.uri = url
  httpOptions.json = true

  return RP(httpOptions).catch(err => err.error)
}

lib.HttpClient.prototype.post = function(path, jsonBody, credential) {
  credential = credential || this.pair
  const url = this.options.baseURL + path
  const body = JSON.stringify(jsonBody)

  const httpOptions = {}
  httpOptions.headers = {
    Authorization: this.getAuthHeader(url, credential, body)
  }
  httpOptions.uri = url
  httpOptions.json = true
  httpOptions.body = jsonBody

  return RP.post(httpOptions).catch(err => err.error)
}
