# Entry point

JetBrains AI Platform pro vides a common API entry point for all features available on the Platform.
The entry point to the JetBrains AI Platform API differs depending on the stack:
 * Staging: `https://api.a pp.stgn.grazie.aws.intellij.net`
 * Production: `https://api .jetbrains.ai`
When developing integrations, the recommended approach is to avoid hard coding t he entry point. Instead, fetch and parse the JSON configuration file that contains Pla tform configuration details, including the proper API entry point to use. This ensures that you always have the correct API URL for the specific Platform stack and geographic implementation. To learn more about configuration files, see Get configuration.
## OpenAPI specification OpenAPI specification of the JetBrains AI Platform API is available on s taging. To see the full specification, go to https://api.app.stgn.grazie.aws.intellij.net/swagger. 
## Clients Our API clients can simplify the process of integrating a nd working with the API, making it easier to focus on the core functionalities of your product. To learn more abou t clients, see Kotlin/JVM client setup and Python client setup.
## Playground The Playground lets you test JetBrains AI Platfo rm services by making them accessible in a single location and available throu gh a visual interface. The AI services target specific tasks and use cases and are based on a variety of mode ls, including dedicated in-house models, LLMs by third-party providers, open-source LLMs, and much more.
In addition to the production deployment ( platform.jetbrains.ai), Playground is also available as a staging environment (platform.stgn.jetbrains.ai).