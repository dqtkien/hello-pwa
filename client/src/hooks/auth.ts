import { encode, decode } from 'base64-arraybuffer';
import base64url from 'base64url';
import axios from 'axios';

// Call backend to get challenged key string
// Server will save this key string for each deviceId
// For now it is dummy text
// Devices table should be look like this:
//	_id: String, // long lived cookie
// challenge: String, // server side random generated string
// counter: Number, // protects from the so called replay attacks
// publicKey: String, // public key created by the fingerprint scanner -> It is an id in Object
// attestationObject: String, // low level device data (BASE64 binary)
// clientDataJSON: String, // BASE64 encoded JSON info of the website
// userAgent: String, // last seen user-agent HTTP header
// user: ObjectId, // the link back to the user, aka the foreign key
// 1. generateChallenge (server)
// 2. getChallenage (client)
// 3. createPublickey (client)
// 4. send this publicKey from step 2 to server to verify this key

const publicKeyCredentialToJSON = (pubKeyCred: any): any => {
  if (pubKeyCred instanceof ArrayBuffer) {
    return encode(pubKeyCred);
  } else if (pubKeyCred instanceof Array) {
    return pubKeyCred.map(publicKeyCredentialToJSON);
  } else if (pubKeyCred instanceof Object) {
    const obj: any = {};
    for (let key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  } else return pubKeyCred;
};

const useNewBiometricAuth = () => {
  navigator.credentials.preventSilentAccess();
  const challengeString = '6ed375d10e264bd9752ff718';

  // 2.
  const getChallenge = () => {
    return decode(challengeString);
  };

  // 3.
  const createPublickey = async (challenge: ArrayBuffer) => {
    const user = {
      id: 123,
      email: ' dqtkien@gmail.com',
      displayName: 'Kevin ABC',
    };
    const attestation = await navigator.credentials.create({
      publicKey: {
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 1800000,

        challenge,
        rp: { id: window.location.hostname, name: 'My Test Hello PWA' },
        user: {
          id: decode(user.id.toString()),
          name: user.email,
          displayName: user.displayName,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
      },
    });

    const webAuthnAttestation = publicKeyCredentialToJSON(attestation);
    return webAuthnAttestation;
  };

  // 4.
  const verifyAndStorePublicKey = async (publicKey: any) => {
    const result = await axios.post(
      'http://localhost:4000/v1/validate-and-store-pbkey',
      {
        publicKey,
      }
    );
    console.log(result);
  };

  return {
    getChallenge,
    createPublickey,
    verifyAndStorePublicKey,
  };
};

const useVerifyBiometricAuth = () => {
  const requestAuth = async (publicKey: string, challenge: string) => {
    const assertionObj = await navigator.credentials.get({
      publicKey: {
        challenge: decode(challenge),
        rpId: 'localhost',
        allowCredentials: [
          {
            type: 'public-key',
            id: decode(publicKey),
            transports: ['internal'],
          },
        ],

        timeout: 6000,
      },
    });

    const webAuthnAttestation = publicKeyCredentialToJSON(assertionObj);
    return webAuthnAttestation;
  };

  return { requestAuth };
};
export { useNewBiometricAuth, useVerifyBiometricAuth };
