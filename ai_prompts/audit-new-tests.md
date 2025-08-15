  ---
  Integration Test Analysis Prompt:

  Please analyze the CarFixer codebase and create a prioritized list of integration
  tests that should be implemented. Focus specifically on:

  Analysis Criteria:
  1. Complex Multi-Step Flows - Workflows that involve multiple components, API calls,
  and state changes
  2. Cross-System Integration - Features that span frontend/backend with multiple
  database operations
  3. Authentication & Authorization Flows - Session management, role switching, and
  permission checks
  4. Data Consistency - Operations that modify multiple related entities
  5. Error-Prone Scenarios - Flows with high potential for race conditions, cache
  invalidation issues, or state inconsistencies

  Priority Levels:
  - P0 (Critical) - Core business flows that would break the app if they fail
  - P1 (High) - Important user journeys that affect user experience significantly
  - P2 (Medium) - Secondary flows that would cause confusion but not complete failure
  - P3 (Low) - Edge cases or less common scenarios

  For Each Test, Provide:
  1. Test Name - Clear, descriptive name
  2. Priority Level - P0-P3 with justification
  3. Flow Description - Step-by-step user journey
  4. Technical Complexity - What makes this flow complex/unreliable
  5. Risk Assessment - What could go wrong without this test
  6. Test Scenarios - Happy path + key error scenarios

  Areas to Examine:
  - User onboarding and role selection flows
  - Account switching between personal/organization contexts
  - Organization creation and user type upgrades
  - Authentication flows (login, logout, session persistence)
  - Work order management across different user contexts
  - Customer/vehicle management with proper data isolation
  - Multi-tenant data access patterns
  - Real-time updates and cache invalidation
  - Form submissions with complex validation
  - File uploads and data processing
  - Search and filtering operations
  - Permissions and role-based access control

  Output Format:
  ## P0 (Critical) Integration Tests
  ### 1. [Test Name]
  - **Flow**: [Step-by-step description]
  - **Complexity**: [Why this is complex/unreliable]
  - **Risk**: [Impact of failure]
  - **Scenarios**: [Happy path + error cases]

  [Continue for each priority level]

  Please provide specific, actionable test recommendations based on the actual codebase
   architecture and identify the most valuable tests that would catch real integration
  issues.
