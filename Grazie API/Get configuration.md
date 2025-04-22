# Current capability

To avoid hard coding of parameters related to the JetBrains AI Platform in other products, the Platform provides a _JSON config file_ that stores the current properties and capabilities of the Platform, such as API URLs. Other JetBrains products that use the JetBrains A I Platform should fetch and parse the file to get the latest configuration items.
The confi g file provides the following information:
 * _API entry point_ to be used for calls to the JetBrains AI Platform.
## Config file locations The location of the JSON config file differs depending on the envir onment and territorial differentiation. Here are the locations of config files for the JetBrains AI Pla tform:
Territorial availabi lity| Environment| URL 
=F0 9F=8C=8D Global| PROD| https://www.jetbrains.com/config/JetBrainsAIPlatform.json 
=F0=9F=8C=8D Global| STGN| https://config.stgn.gra zie.aws.intellij.net/config/JetBrainsAIPlatform.json F0=9F=87=A8=F0=9F=87=B3 China| PROD| https://www.jetbrains.com.cn/config/JetBrain sAIPlatform.json F0=9F=87=A8=F0=9F=87=B3 China| STGN| [](<"https://config.stgn.ai.jetbr=>) 
## File structure Here is an example of a JSON config file:
 "urls":
 /span>
 url":"https://api.jetbrains.ai/",
 priority":1,
 deprecated":false
 /span>,
 /span>
 url":"https://api.app.prod.grazie.aws.intellij.net/",
 priority":2,
 deprecated":false
 /span>
## URLs The file structure consists of the `urls` array that contains objects with the follow ing keys:
Name| Value type| Description 
`url`| string| The entry point of the JetBr ains AI Platform API. 
priority| integer| The use priority (preference) for the API URL. Lower value means that the URL is preferred over those with a higher priority value. 
`deprecate d`| boolean| If true, do not use the URL as it is meant to be discon tinued and removed. 
The file is extensible and new elements may be added to it, so it s parsing _should not fail if the schema changes in the future_.
## Kotlin client implementation The Kotlin/JVM client for the JetBrains AI Platform implements a set of classes and interfaces that let yo u get and use Platform configuration natively from your application code. _This implementation is availabl e only for production configurations._ Here is an example of Platform URL resolution and client initializatio n in Kotlin:
 val resolutionRes=
 ult 3D DefaultUrlResolver(PlatformConfigurationUrl.Production<=
 span class=3D"token punctuation">.GLOBAL, httpClient).=
 resolve()
 val serverUrl 3D when (re=
 solutionResult) {
 is<=
 span > ResolutionResult.=
 Failure ->=
 span >
 // Thr=
 ow an exception if the configuration file can't be downloaded throw<=
 /span> resolutionResult.problems.first()
 is ResolutionResult.=
 FallbackUrl -> {
 // Log=
 a warning that the default URL is not accessible print=
 ln(resolut=
 ionResult.=
 problems)
 // Use=
 a fallback URL instead of the default one resolutionResult.url is ResolutionResult.=
 Success ->=
 resolutionResult=
 .url