import { Buffer } from 'buffer';

const bufferToBase64 = (buffer: Buffer | ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

// Call backend to get challenged key string
// Server will save this key string for each deviceId
// For now it is dummy text
// Devices table should be look like this:
//	_id: String, // long lived cookie
// challenge: String, // server side random generated string
// counter: Number, // protects from the so called replay attacks
// publicKey: String, // public key created by the fingerprint scanner
// attestationObject: String, // low level device data (BASE64 binary)
// clientDataJSON: String, // BASE64 encoded JSON info of the website
// userAgent: String, // last seen user-agent HTTP header
// user: ObjectId, // the link back to the user, aka the foreign key
// 1. getChallenge (server)
// 2. createPublickey (client)

const useNewBiometricAuth = () => {
  navigator.credentials.preventSilentAccess();

  const getChallenge = () => {
    return Buffer.from('a46e958a-3e18-4d86-9e96-8e61f6b556bc');
  };

  const createPublickey = async (challenge: Buffer) => {
    const user = {
      id: 123,
      email: ' abc2@gmail.com',
      displayName: 'Kevin ABC',
    };
    const attestation = await navigator.credentials.create({
      publicKey: {
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        challenge: new Uint8Array(challenge).buffer,
        rp: { id: document.domain, name: 'My Test Hello PWA' },
        user: {
          id: Uint8Array.from(Buffer.from(user.id.toString())),
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

  function publicKeyCredentialToJSON(pubKeyCred: any): any {
    if (pubKeyCred instanceof ArrayBuffer) {
      return bufferToBase64(pubKeyCred);
    } else if (pubKeyCred instanceof Array) {
      return pubKeyCred.map(publicKeyCredentialToJSON);
    } else if (pubKeyCred instanceof Object) {
      const obj: any = {};
      for (let key in pubKeyCred) {
        obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
      }
      return obj;
    } else return pubKeyCred;
  }

  return {
    getChallenge,
    createPublickey,
  };
};

export default useNewBiometricAuth;
