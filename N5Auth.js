var N5Auth = (function ($) {
    var n5 = {};
    var settings;

    n5.Init = function (newSettings) {
        console.log("Initializing N5Auth")
        settings = newSettings || {};

        console.log("- urlAuthorizeEndpoint=" + settings.urlAuthorizeEndpoint);
        n5.authdata = {};
    };

    n5.Authorize = function () {
        var req = createRequest(
                    "n5-js-demo",
                    "http://n5-js-demo.kxml.no/index.html",
                    'openid profile email n5api',
                    'id_token token');

        console.log("req.state=" + req.state);
        //store.set(req.state);

        window.location = req.url;
    };

    n5.CheckAuthentication = function () {
        console.log("Checking authentication");
        var isAuthenticated = false;

        var hash = document.URL.substr(document.URL.indexOf('#') + 1);
        var response = parseServerResponse(hash);
         
        if (response) {
            console.log("Checking validity of the authentication response.");
            n5.authdata.raw_response = JSON.stringify(response, null, 2);

            if (response.id_token) {
                var cert = getCertificate();
                try {
                    var jws_id = new KJUR.jws.JWS();
                    var certVerifyResult = jws_id.verifyJWSByPemX509Cert(response.id_token, cert);
                    if (certVerifyResult == 1) {
                        n5.authdata.id_token_json = JSON.stringify(JSON.parse(jws_id.parsedJWS.payloadS), null, 2);
                        console.log("id token: " + n5.authdata.id_token_json);
                        isAuthenticated = true;
                    } else {
                        n5.authdata.id_token_json = "JWS signature is *Invalid*.";
                    }
                } catch (ex) {
                    console.error("Error while verifying response signature.", ex);
                }
            }

            if (response.access_token) {
                n5.authdata.access_token = response.access_token;

                var jws = new KJUR.jws.JWS();
                jws.parseJWS(response.access_token);
                n5.authdata.access_token_json = JSON.stringify(JSON.parse(jws.parsedJWS.payloadS), null, 2);

                console.log("access token: " + n5.authdata.access_token_json);
                isAuthenticated = true;
            }
        } else {
            console.log("Client is not authenticated.");
        }

        return isAuthenticated;
    };

    function getCertificate() {
        var cert = null;
        $.ajax({
            type: "GET",
            url: settings.urlCertificateStore,
            async: false,
            success: function (data) {
                cert = data.keys[0].x5c[0];
            }
        });
        return cert;
    }

    function createRequest(clientid, callback, scope, responseType) {
        responseType = responseType || "token";

        var state = createRandomString();
        var nonce = createRandomString();

        var url =
            settings.urlAuthorizeEndpoint + "?" +
            "client_id=" + encodeURIComponent(clientid) + "&" +
            "redirect_uri=" + encodeURIComponent(callback) + "&" +
            "response_type=" + encodeURIComponent(responseType) + "&" +
            "scope=" + encodeURIComponent(scope) + "&" +
            "state=" + encodeURIComponent(state) + "&" +
            "nonce=" + encodeURIComponent(nonce);

        return {
            url: url,
            state: state,
            nonce: nonce
        };
    }

    function createRandomString() {
        var s = (Date.now() + Math.random()) * Math.random();
        return s.toString().replace(".", "");
    }

    function parseServerResponse(queryString) {
        var params = {},
            regex = /([^&=]+)=([^&]*)/g,
            m;

        while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

        for (var prop in params) {
            return params;
        }
    }

    return n5;
}(jQuery));