const express = require('express');
const base64url = require('base64url');
const cbor = require('cbor');
const assert = require('assert');
const router = express.Router();

let authData = '';
let pbkey = '';

const challengeString = '6ed375d10e264bd9752ff718';

function parseAttestationObject(attestationObject) {
  const buffer = base64url.toBuffer(attestationObject);
  return cbor.decodeAllSync(buffer)[0];
}

// Register a new finger print
router.post('/validate-and-store-pbkey', async (req, res) => {
  const publicKey = req.body.publicKey;
  assert(publicKey.type === 'public-key');

  const clientDataJSON = JSON.parse(
    base64url.decode(publicKey.response.clientDataJSON)
  );
  console.log('clientDataJson', clientDataJSON);
  assert(clientDataJSON.challenge === challengeString);
  assert(clientDataJSON.type === 'webauthn.create');

  const attestationObject = publicKey.response.attestationObject;
  const makeCredsReponse = parseAttestationObject(attestationObject);
  console.log('checlk', makeCredsReponse);
  assert(makeCredsReponse.fmt === 'none');
  assert(makeCredsReponse.authData);
  authData = makeCredsReponse.authData;
  pbkey = publicKey.id;
  console.log(pbkey);

  return res.json({ mess: 'ok' });
});

// Verify finger print flow
// 1. Call server to get the new challenge string and stored public key
router.get('get-challenge-and-pbkey', async (req, res) => {
  console.log('pbKey', pbkey);
  return res.json({
    pbKey: 'x-1cIqSCQ0zTiqgSHf4tqOOgbBY1RDDUfYKjdhGIaMk',
    newChallenge: '6c2c79443c4a327054b8f8e030c89938',
  });
});

module.exports = router;
