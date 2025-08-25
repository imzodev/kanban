This project uses bun, everytime you need to install a new package use bun add <package-name>

This project uses the following technologies:
- Next.js 15.5.0
- TypeScript 5.5.2
- Tailwind CSS 4.0.0
- React 19.1.0

General Principles
Follow SOLID principles in architecture (single responsibility, open/closed, etc.), but treat dependency injection as a general guideline, not a rigid requirement.

Prioritize code modularity and reusability. Components and functions should do one thing and do it well.

Consistency with team/project coding standards, naming conventions, and folder structures is essential.

Write code that is easily testable, understandable, and maintainable by other developers.

Maintain clear documentation for complex logic, AI prompts, and configuration files.

Security and Quality
Always include basic error handling, input validation, and security best practices (avoid code injection, command injection, missing authentication, etc.).

Avoid the use of deprecated or insecure libraries or APIs where possible.

Prefer explicit handling of data and side effects over hidden state or implicit assumptions.

Prompts and AI Interaction
AI-related prompts and context should be as clear, specific, and concise as possible for coding tasks.

Document key prompt patterns, expected model behaviors, and prompt limitations within the codebase or a dedicated file.

Dependency Management
Structure code into layers or modules with clear boundaries (e.g., data, logic, interface layers).

Use dependency injection or similar techniques to decouple modules when it adds value—but it is acceptable to initialize dependencies directly in simple or low-risk cases.

Wherever possible, use abstract interfaces for key integrations (database, external APIs), but pragmatism is encouraged for rapid prototyping or low-coupling scenarios.

Version Control and Automation
All rules, documentation, and configuration files must be stored in version control.

Strive for automation in linting, formatting, and testing, leveraging CI/CD pipelines where available.