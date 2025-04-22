# Authentication token

The JetBrains AI Platform provides various AI features that are available through the API, so you can integrate them into your application. 
You can either communicate with the P latform by making requests in a programming language of your choice or by u sing one of our API clients.
This sect ion describes the basic steps to get started with the JetBrains AI Platform , including instructions on how to:
 1. Obtain an authentication token.
 2. Install and configure the API client for your pr eferred programming language.
 3. Make y our first API request.
Bel ow you can find brief descriptions of key concepts you need to understand, along with helpful links for additional information.
An authentication token is required for accessing the JetBrains AI Platfo rm. The process of obtaining and setting up the token differs depending on the authentication type.
## Platform pro perties When developing integr ations with the JetBrains AI Platform, it is important to get the correct P latform properties. All the properties are stored in the configuration file that you ne ed to fetch and parse.
Our Kotlin/JVM client provides a unified way to fetch and parse this file.
API entry points To successfully make requests t o the JetBrains AI Platform API, you need to provide the right API entry po int. The API entry point is stored in the configuration file.

## API clients Our Kotlin/JVM and Python clients simplify integrating features into your application. Using the clients, you can focus on core functionality. To le arn more about installing and configuring the clients, refer to the API clients section.
## Task-based prompting Th e task-based prompting is a semantic approach to interacting with the JetBr ains AI Platform. To learn more about the Task API that implements the task -based prompting, refer to the Task API s ection.