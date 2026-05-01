name: implement-feature

description: An automated end-to-end development pipeline that leverages Trello MCP and GitHub Actions to transform user stories into verified code.

Execution Steps

1.  **Input Identification**
    * Accept the unique ID of a Trello story card as the starting trigger.

2.  **Context Retrieval (Trello MCP)**
    * Utilize the **Trello MCP (Model Context Protocol)** to fetch detailed content from the specified story card within the **ZLog board**.
    * Extract functional requirements and predefined test cases from the card's description and attachments.

3.  **Parallel Sub-task Execution**
    * **Task A: Functional Implementation** – Implement the core business logic based on requirements.
    * **Task B: Unit Testing** – Develop comprehensive unit tests to ensure code-level reliability.
    * **Task C: E2E Verification** – Once Task A and B are completed, execute functional verification using **Playwright** to ensure the UI and user flows meet the specifications.

4.  **Contribution & Code Review**
    * Commit the verified changes to a feature branch.
    * Automatically create a **Pull Request (PR)** to the GitHub repository.

5.  **CI/CD Integration & Merging**
    * Trigger **GitHub Actions** to perform pipeline compilation and automated testing.
    * Upon successful build and verification, automatically merge the Pull Request into the `main` branch.
