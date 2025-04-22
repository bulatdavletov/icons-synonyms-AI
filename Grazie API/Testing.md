# Grazie-Force-HTTP-Error=

To make testing easier, JetBrains AI Platform provides features tha t you can use specifically for testing purposes. Currently supported features include: 
 * Grazie-Force-HTTP-Error request he ader T his feature is available only in the JetBrains AI Platform staging environm ent.
This header lets you enforce the Platform API to return an HTTP error. The expected header value is the HTTP status code that you want to return. 
### Req uest Here is an example of a request that includes the `Grazie-Forc e-HTTP-Error` header:
 GET /ping HTTP/1.1 Host: api.ap=
 p.stgn.grazie.aws.intellij.net Grazie-Force-HTTP-Error: 429
### Response The Platform returns the HTTP status code that you specifie d in the `Grazie-Force-HTTP-Error header, along with the following response body: `
 Forced error test feature.