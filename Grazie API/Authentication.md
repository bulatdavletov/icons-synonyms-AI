# Authentication tokens

Th e JetBrains AI Platform uses token-based authentication with JSON Web Token s (JWT) to authenticate clients and provide access to Platform resources an d features.
The Platform supports seve ral authentication types to verify the identity of those making requests. T o choose the most appropriate type, consider which tasks you need to do using the Platform.
Type| Description User| User authentication is used to verify the identity of an individual user. For example, the user of an application su ch as IntelliJ IDEA.It is suitable if you want to explore the Platform features or, for example, develop an MVP application for a small audience.This authentication type has a limited number of API requests and available Pla tform resources. 
Applic ation| Application authentication is used to verify the identity of a client a pplication that uses the JetBrains AI Platform, such as YouTrack or Datalor e.It is suitable if you want to devel op an application that requires a large amount of Platform resources. It ca n also be used for research that involves extensive requests to LLMs, which also requires significant Platform resource s.The number of API requests and the number of available Platform resources are limited, but higher than for the user authentication type. 
The following limitations apply to each authentication type:
 * Quota limits that control the total resources expended on the use of the Platform.
 * Throttling limits that control the number of requests sent to the Platform .
 * Territory limitations that involve restricting access to t he platform resources based on the geolocation of the user.
The limits vary depending on the authentication type you use.
To access protected resources and features through t he Platform API, you need an authentication token. The JetBrains AI Platfor m API uses different tokens to authenticate users and applications.
3D"note"The authentication tokens are obtained based on the target JetBrains AI Platform environment (staging or production) and geographic re gion. The tokens obtained from the staging environment are not valid for the production environment and vi ce versa. The same concept applies to regions.
To store the authentication token safely, save it as an e nvironment variable or use a secure storage solution.
### User token A user token is issued to authenticate with t he Platform by using the user authentication type. The quota limit for user tokens is updated every week. For more details about the quota limits, see Quota.
To get a user token:
 1. Log in to the AI Playground with your JetBrains Account. Choose either t he staging or production version of the Playground, depending on the platform environment you want to access.
 2. Click your avatar in the upper right corner of the page and select Copy Develop ment Token. "Copy 3. In the User token dialog, click the Copy token button. Alternatively, click th e displayed token. 3D"User Before making API requests, save the token as an environment variable or in a secure storage. The token is valid for a limited period of time.
The User token dialog provi des the following information about your token:
Field| Descripti on creditsQuota limit in credits. 
Quota renews| Time that remains before the current quota limit is reset to its ful l capacity. The quota limit for user tokens is updated every week. 
Token expi res| Token expiration date. The user token is renewed every two weeks. 
For more details about the quota limits, see Quota.
### Application to ken An application token is is sued to authenticate with the Platform by using the application authenticat ion type.
The quota limit for the appl ication token is set once for its lifetime and can be increased by contacti ng the support team. The expiration time for the application token is set by adm inistrators who issue these tokens.
To get an application token:
 * Contact the support team.
 * Create a Yo uTrack issue.
Before making API requests, save the token as an environment variable or in a secure storage. The token is valid for a limited period of time.