const Assert = require('assert')
const Utils = require('trustedkey-js/utils')

const mock = module.exports

mock.Config = require('./options').loadOptions()

/**
 * @param {String} url URL to authorize
 * @param {Object} credential key pair
 * @param {Object?} [body] Optional body
 * @param {String?} [key] Optional app key
 * @param {String?} [secret] Optional app secret
 * @return {String} Nested JWT
 */
mock.getNestedJwt = function(url, credential, body, key, secret) {
  Assert.strictEqual(typeof url, 'string', 'url must be of type `string`')
  Assert.strictEqual(typeof credential, 'object', 'credential must be of type `object`')
  const iat = Utils.getUnixTime()
  const hash = body ? Utils.sha256(JSON.stringify(body), 'hex') : null
  const claims = {aud: url, iat: iat, exp: iat + 60, body: hash}
  if (credential === null) {
    // Create a JWT without user credentials
    return Utils.createHmacJws(claims, secret || mock.Config.clientSecret, {
      typ: 'JWT',
      iss: key || mock.Config.clientId
    })
  } else {
    const innerJwt = Utils.createEcdsaJws(claims, credential, {typ: 'JWT'})
    const jwk = Utils.hexToJwk(credential.pubKeyHex)
    return Utils.createHmacJws(innerJwt, secret || mock.Config.clientSecret, {
      cty: 'JWT',
      iss: key || mock.Config.clientId,
      jwk: jwk
    })
  }
}

/**
 * @param {String} url URL to authorize
 * @param {Object} credential key pair
 * @param {Object?} [body] Optional body
 * @param {String?} [key] Optional app key
 * @param {String?} [secret] Optional app secret
 * @return {String} Bearer HTTP header
 */
mock.getAuthorizationHeader = function(url, credential, body, key, secret) {
  return 'Bearer ' + mock.getNestedJwt(url, credential, body, key, secret)
}

function generateSub(clientKey, userid) {
  Assert.strictEqual(typeof clientKey, 'string', 'clientKey must be of type `string`')
  Assert.strictEqual(typeof userid, 'string', 'userid must be of type `string`')
  return Utils.sha256(clientKey + userid, 'hex').slice(2 * 12)
}

/**
 * @param {Object} credential key pair
 * @param {String} clientKey client ID of app mocking the authentication
 * @param {String} aud audience for the resulting JWT
 * @param {String} nonce Nonce to authenticate
 * @param {String} userid User ID (root address) to authenticate
 * @param {String|null} [access_token] Access Token
 * @return {String} id_token JWT
 */
function createToken(credential, clientKey, aud, nonce, userid, access_token) {
  Assert.strictEqual(typeof credential, 'object', 'credential must be of type `object`')
  Assert.strictEqual(typeof clientKey, 'string', 'clientKey must be of type `string`')
  Assert.strictEqual(typeof aud, 'string', 'aud must be of type `string`')
  Assert.strictEqual(typeof nonce, 'string', 'nonce must be of type `string`')
  Assert.strictEqual(typeof userid, 'string', 'userid must be of type `string`')
  // 2.  ID Token

  // The primary extension that OpenID Connect makes to OAuth 2.0 to enable End-Users to be Authenticated is the ID
  // Token data structure. The ID Token is a security token that contains Claims about the Authentication of an End-
  // User by an Authorization Server when using a Client, and potentially other requested Claims. The ID Token is
  // represented as a JSON Web Token (JWT) [JWT].

  // The following Claims are used within the ID Token for all OAuth 2.0 flows used by OpenID Connect:
  const claims = {}

  // iss  REQUIRED. Issuer Identifier for the Issuer of the response. The iss value is a case sensitive URL using the
  // https scheme that contains scheme, host, and optionally, port number and path components and no query or fragment
  // components.
  claims.iss = mock.Config.clientId

  // sub  REQUIRED. Subject Identifier. A locally unique and never reassigned identifier within the Issuer for the
  // End-User, which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
  // It MUST NOT exceed 255 ASCII characters in length. The sub value is a case sensitive string.
  claims.sub = generateSub(clientKey, userid)

  // aud  REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the
  // Relying Party as an audience value. It MAY also contain identifiers for other audiences. In the general case, the
  // aud value is an array of case sensitive strings. In the common special case when there is one audience, the aud
  // value MAY be a single case sensitive string.
  claims.aud = [clientKey, aud]

  // exp  REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing. The processing
  // of this parameter requires that the current date/time MUST be before the expiration date/time listed in the
  // value. Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock
  // skew. Its value is a JSON number representing the number of seconds from 1970-01-01T0:0:0Z as measured in UTC
  // until the date/time. See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.
  claims.exp = Utils.getUnixTime() + 30 * 60

  // iat  REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds
  // from 1970-01-01T0:0:0Z as measured in UTC until the date/time.
  claims.iat = Utils.getUnixTime()

  // auth_time  Time when the End-User authentication occurred. Its value is a JSON number representing the number of
  // seconds from 1970-01-01T0:0:0Z as measured in UTC until the date/time. When a max_age request is made or when
  // auth_time is requested as an Essential Claim, then this Claim is REQUIRED; otherwise, its inclusion is OPTIONAL.
  // (The auth_time Claim semantically corresponds to the OpenID 2.0 PAPE [OpenID.PAPE] auth_time response parameter.)
  claims.auth_time = claims.iat

  // nonce  String value used to associate a Client session with an ID Token, and to mitigate replay attacks. The
  // value is passed through unmodified from the Authentication Request to the ID Token. If present in the ID Token,
  // Clients MUST verify that the nonce Claim Value is equal to the value of the nonce parameter sent in the
  // Authentication Request. If present in the Authentication Request, Authorization Servers MUST include a nonce
  // Claim in the ID Token with the Claim Value being the nonce value sent in the Authentication Request.
  // Authorization Servers SHOULD perform no other processing on nonce values used. The nonce value is a case
  // sensitive string.
  Assert.strictEqual(typeof nonce, 'string')
  claims.nonce = nonce

  // at_hash  OPTIONAL. Access Token hash value. This is OPTIONAL when the ID Token is issued from the Token Endpoint,
  // which is the case for this subset of OpenID Connect; nonetheless, an at_hash Claim MAY be present. Its value is
  // the base64url encoding of the left-most half of the hash of the octets of the ASCII representation of the
  // access_token value, where the hash algorithm used is the hash algorithm used in the alg Header Parameter of the
  // ID Token's JOSE Header. For instance, if the alg is RS256, hash the access_token value with SHA-256, then take
  // the left-most 128 bits and base64url-encode them. The at_hash value is a case-sensitive string.
  if (access_token) {
    claims.at_hash = Utils.sha256(access_token, 'hex').slice(0, 32)
  }

  // acr  OPTIONAL. Authentication Context Class Reference. String specifying an Authentication Context Class
  // Reference value that identifies the Authentication Context Class that the authentication performed satisfied.
  // The value "0" indicates the End-User authentication did not meet the requirements of ISO/IEC 29115 [ISO29115]
  // level 1. Authentication using a long-lived browser cookie, for instance, is one example where the use of "level
  // 0" is appropriate. Authentications with level 0 SHOULD NOT be used to authorize access to any resource of any
  // monetary value. (This corresponds to the OpenID 2.0 PAPE [OpenID.PAPE] nist_auth_level 0.) An absolute URI or an
  // RFC 6711 [RFC6711] registered name SHOULD be used as the acr value; registered names MUST NOT be used with a
  // different meaning than that which is registered. Parties using this claim will need to agree upon the meanings of
  // the values used, which may be context-specific. The acr value is a case sensitive string.

  // amr  OPTIONAL. Authentication Methods References. JSON array of strings that are identifiers for authentication
  // methods used in the authentication. For instance, values might indicate that both password and OTP authentication
  // methods were used. The definition of particular values to be used in the amr Claim is beyond the scope of this
  // specification. Parties using this claim will need to agree upon the meanings of the values used, which may be
  // context-specific. The amr value is an array of case sensitive strings.

  // azp  OPTIONAL. Authorized party - the party to which the ID Token was issued. If present, it MUST contain the
  // OAuth 2.0 Client ID of this party. This Claim is only needed when the ID Token has a single audience value and
  // that audience is different than the authorized party. It MAY be included even when the authorized party is the
  // same as the sole audience. The azp value is a case sensitive string containing a StringOrURI value.
  claims.azp = mock.Config.clientId

  // FIXME: only add this if explicitly asked for by OID.publicKey
  claims.sub_jwk = Utils.hexToJwk(credential.pubKeyHex)

  return Utils.createEcdsaJws(claims, credential, {typ: 'JWT'})
}

/**
 * @return {String} callback URL
 */
function buildCallbackUrl(callbackUrl, result, nonce, id_token, certs, chain) {
  Assert.strictEqual(typeof callbackUrl, 'string', 'callbackUrl must be of type `string`')
  Assert.strictEqual(typeof nonce, 'string', 'nonce must be of type `string`')
  if (certs instanceof Array) {
    certs = certs.join(',')
  }
  if (chain instanceof Array) {
    chain = chain.join(',') || undefined
  }
  if (typeof result === 'boolean') {
    result = result ? 'success' : 'error'
  }
  return Utils.mergeQueryParams(callbackUrl, {
   result: result,
    nonce: nonce,
    id_token: id_token,
    certs: certs,
    chain: chain
  })
}

/**
 * @param {Object} credential key pair
 * @param {String} callbackUrl the URL that receives the wallet callback
 * @param {String} clientKey client ID of app mocking the authentication
 * @param {String} nonce Nonce to authenticate
 * @param {String} [userid] User ID (root address) to authenticate
 * @param {Array|boolean} [certs] Tokens to send to callback
 * @param {Array} [chain] Intermediary certificates
 * @return {String} callback URL
 */
mock.buildClaimCallback = function(credential, callbackUrl, clientKey, nonce, userid, certs, chain) {
  Assert.strictEqual(typeof credential, 'object', 'credential must be of type `object`')
  Assert.strictEqual(typeof callbackUrl, 'string', 'callbackUrl must be of type `string`')
  Assert.strictEqual(typeof clientKey, 'string', 'clientKey must be of type `string`')
  Assert.strictEqual(typeof nonce, 'string', 'nonce must be of type `string`')

  const address = userid || Utils.userPubKeyHexToAddress(credential.pubKeyHex)
  const id_token = createToken(credential, clientKey, callbackUrl, nonce, address)
  if (typeof certs === 'boolean') {
    return buildCallbackUrl(callbackUrl, certs, nonce, id_token)
  } else {
    return buildCallbackUrl(callbackUrl, !!certs, nonce, id_token, certs, chain)
  }
}

/** Generate a new key pair.
 * @param {string} [privHex] Hex-encoded private key
 * @param {string} [pubKeyHex] Hex-encoded public key
 * @return {Object} key pair
 */
mock.generateKeypair = function(privHex, pubKeyHex) {
  const pair = Utils.generateKeyPair('secp256r1')
  if (privHex && pubKeyHex) {
    Assert.strictEqual(typeof privHex, 'string', 'privHex must be of type `string`')
    Assert.strictEqual(typeof pubKeyHex, 'string', 'pubKeyHex must be of type `string`')
    // Used pre-generated keypair to avoid polluting the database
    pair.setPrivateKeyHex(privHex)
    pair.setPublicKeyHex(pubKeyHex)
  }
  pair.address = Utils.userPubKeyHexToAddress(pair.pubKeyHex)
  // console.log(pair.prvKeyHex, pair.pubKeyHex, pair.address)
  return pair
}

/** Sign the given digest with key.
 * @param {Object} credential Jsrsasign credential
 * @param {string} digest Hex-encoded digest
 * @return {string} Hex-encoded DER sig
 */
mock.createDocumentSignature = function(credential, digest) {
  Assert.strictEqual(typeof credential, 'object', 'credential must be of type `object`')
  Assert.strictEqual(typeof digest, 'string', 'digest must be of type `string`')

  return credential.signWithMessageHash(digest)
}

/** Find claims by required OIDs.
 * @param {string[]} pems PEM
 * @param {string[]} oids OID
 * @return {string[]} Hex-encoded DER sig
 */
mock.matchClaims = function(pems, oids) {
  Assert.ok(Array.isArray(pems), 'pems must be of type `Array`')
  Assert.ok(Array.isArray(oids), 'oids must be of type `Array`')

  // Look for both old and new OIDs in the provided claims
  const oldOid = oid => oid.replace('.51341.', '.53318295.')
  return oids.map(oid => pems.find(claim => oid in claim.dn || oldOid(oid) in claim.dn)).filter(claim => claim)
}
