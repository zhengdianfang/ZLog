name: implement-feature

args:
  - name: trello_card_name
    description: The name of the Trello card to implement. Used to look up the card's description and requirements on the ZLog board.
    required: true

description: An automated end-to-end development pipeline that leverages Trello MCP and GitHub Actions to transform user stories into verified code.

Execution Steps

1.  **Input Identification**
    * Accept `{{trello_card_name}}` — the name of the Trello story card — as the starting trigger.

2.  **Context Retrieval (Trello MCP)**
    * Utilize the **Trello MCP (Model Context Protocol)** to search for the card by name (`{{trello_card_name}}`) within the **ZLog board**.
    * Fetch the matched card's full details, including its description and any attachments.
    * Extract functional requirements and predefined test cases from the card's description.

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
