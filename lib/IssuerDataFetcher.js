"use strict";

import axios from "axios";

class IssuerDataFetcher {
  preparePemFormat(issuer_public_key_base64) {
    var issuer_public_key_pem = "-----BEGIN PUBLIC KEY-----\n";
    for (var i = 0; i < issuer_public_key_base64.length; i++) {
      issuer_public_key_pem += issuer_public_key_base64[i]
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      if (i > 0 && i % 64 == 0) {
        issuer_public_key_pem += "\n";
      }
    }
    issuer_public_key_pem += "\n-----END PUBLIC KEY-----\n";
    return issuer_public_key_pem;
  }

  fetchFastlyIssuerData() {
    console.log("Loading Fastly token issuer data");

    return new Promise((resolve) => {
      const issuer_name = "demo-issuer.private-access-tokens.fastly.com";
      var issuer_public_key_base64 =
        "MIICUjA9BgkqhkiG9w0BAQowMKANMAsGCWCGSAFlAwQCAqEaMBgGCSqGSIb3DQEBCDALBglghkgBZQMEAgKiAwIBMAOCAg8AMIICCgKCAgEAubzND7lvK-u5aIFHSt_NHIzsUFuHCiwVm88kvUvbvJbjj4be_IdNwpfdfXz-vq6NeEwlKEDLtD9oMVop_kEf5HEBkiipBrcn10h17XvYPuc6lA7Z4Y8IjvSjLVydXmcabmslwreMysD1ZINjzadjlJxiIKWCeS_3OJ4dxMTirt8HMUl8cRQafTjSOBJIZNtoNiT5rr5_5SYfEQW8v25RZcitkL0Lrg1mkSutRR00EE3zMelQBGR0sf8jDgBRiPQ1-sSgaIicIciZ2ysiPdkQZBIDpIFnvqed4yKY9gZCn-ASztoe1JhJvzWUwO7Nyz1Mb6pxAV0aQNfb0rDMTPNtyF4z7kgtFcsr5SXiJUa13bm0G2QvEdhl177poghh2RDaT5tcEmiRRvdQWBTeVgFyjrX3-29TZCT4z8VyvDxPPIUIi2rN8-9lN6mmsF0KhlyKe4jUuDwK7dc6Q0gZyjKiE3n-ygErrlbOYU16MGQiJQRV6Z8j38OSD4Lf5-SzsgkAa6Zbv95Zf8TZRS-fuagiXGZcmfdO9zXkuNlRlGguEUpx520SANRciPIBZxFBDXga6kcT9Hfha0n97Mhq57kFRe2Cox7qpq79x9TjUvHOZkWMSv2KmZpoF0wbI2NvlZngbW6Z1hC-X4C3evilX7O498r45Ct7PNjq11Qjso82DwMCAwEAAQ==";
      var issuer_public_key_pem = this.preparePemFormat(
        issuer_public_key_base64
      );

      resolve({ issuer_name, issuer_public_key_base64, issuer_public_key_pem });
    });
  }

  fetchIssuerData(dictionaryUrl) {
    console.log("Loading token issuer data from ", dictionaryUrl);

    return new Promise((resolve) => {
      const responsePromise = axios.get(dictionaryUrl, {
        headers: {
          "User-Agent":
            "private-access-tokens-demo +https://github.com/m-keller/private-access-tokens-demo",
        },
      });
      responsePromise.then((response) => {
        const data = response.data;

        // Extract issuer name and issuer public key
        // If we find an absolute URL inside the dictionary we take that info instead
        const issuer_name = data["issuer-request-uri"].startsWith("https://")
          ? data["issuer-request-uri"].replace("https://", "").split("/")[0]
          : dictionaryUrl.replace("https://", "").split("/")[0];

        var issuer_public_key_base64;
        for (var i = 0; i < data["token-keys"].length; i++) {
          const key = data["token-keys"][i];
          if (key["token-type"] == 2) {
            issuer_public_key_base64 = key["token-key"];
            break;
          }
        }

        var issuer_public_key_pem = this.preparePemFormat(
          issuer_public_key_base64
        );

        resolve({
          issuer_name,
          issuer_public_key_base64,
          issuer_public_key_pem,
        });
      });
    });
  }
}

export default IssuerDataFetcher;
