N5Auth.js
=========

NOARK 5 API - JavaScript Authentication library (BETA)

How to use it
=============

Initialize and configure endpoints:

``
N5Auth.Init({
    urlAuthorizeEndpoint: "https://identity.arkitektum.no/core/connect/authorize",
    urlCertificateStore: "https://identity.arkitektum.no/core/.well-known/jwks"
});
``

Are you authenticated?

``
var isAuthenticated = N5Auth.CheckAuthentication();
if (isAuthenticated) {
  console.log("id token" + N5Auth.authdata.id_token_json);
  console.log("access token" + N5Auth.authdata.access_token_json);
}
else {
  N5Auth.Authorize();
}
``

_Remember:_ Your client application has to be registered with the identity server before authentication can be performed. 
