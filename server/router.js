const express = require('express');
const base64url = require('base64url');
const cbor = require('cbor');
const assert = require('assert');
const { verifyAssertion } = require('./ultil');
const router = express.Router();

let authData = '';
let pbkey = '';

const challengeString = '6ed375d10e264bd9752ff718';

const parseAttestationObject = (attestationObject) => {
  const buffer = base64url.toBuffer(attestationObject);
  return cbor.decodeAllSync(buffer)[0];
};

// Register a new finger print
router.post('/validate-and-store-pbkey', async (req, res) => {
  const bioData = req.body.bioData;
  assert(bioData.type === 'public-key');

  const clientDataJSON = JSON.parse(
    base64url.decode(bioData.response.clientDataJSON)
  );

  assert(clientDataJSON.challenge === challengeString);
  assert(clientDataJSON.type === 'webauthn.create');

  const attestationObject = bioData.response.attestationObject;
  const makeCredsReponse = parseAttestationObject(attestationObject);
  assert(makeCredsReponse.fmt === 'none');
  assert(makeCredsReponse.authData);
  authData = makeCredsReponse.authData;
  pbkey = bioData.rawId; // This is public key
  console.log('pbkey', pbkey);

  // Save public key, attestaionObject to database
  return res.json({ mess: 'ok' });
});

// -----------------------------
// Verify finger print flow
// 1. Call server to get the new challenge string and stored public key
router.get('/get-challenge-and-pbkey', async (req, res) => {
  console.log('pbKey', pbkey);
  return res.json({
    pbKey: 'x-1cIqSCQ0zTiqgSHf4tqOOgbBY1RDDUfYKjdhGIaMk', // current public key in database per userId and per deviceId
    newChallenge: '6c2c79443c4a327054b8f8e030c89938', // new random string
  });
});

router.post('/verify-signature', async (req, res) => {
  console.log(req.body);
  const { data } = req.body;
  const result = verifyAssertion({
    counter: 0, // current devide.counter in database
    attestationObject:
      'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFAXl1fbzAgM+QWy0epZlLM+OrHBrpQECAyYgASFYIEYopDZjDbultZjozFjXhE/+r+Wctc525q2qImqwBGaoIlggm2AS7/WNRsSD+NoODom1w5vFUmETDHjP187YuPFFyTU=', // device.attestationObject store in database
    authenticatorData: data.response.authenticatorData,
    clientDataJSON: data.response.clientDataJSON,
    signature: data.response.signature,
  });
  // Generate login flow here
  return res.json({ ok: 'ok' });
});

module.exports = router;
