# O3 Research Context Template

This template shows how to provide context about this repository to AI systems with code blocks for specific files.

## Instructions

1. Start with a brief overview of your project/problem
2. Include tech stack as bullet points
3. Add a directory tree showing structure up to L2
4. Include only the specific files mentioned in the overview
5. Use proper markdown code blocks with language identifiers
6. Keep explanations minimal - let the code speak for itself

## Template Structure

```markdown
# [Project Name] Context

[Brief 1-2 sentence description of the project and tech stack]

## Tech Stack
- [Technology 1]
- [Technology 2]
- [Technology 3]
- [etc.]

## Project Structure
.
├── apps/
│   ├── [app1]/
│   └── [app2]/
├── packages/
│   └── [package1]/
└── [other-root-dirs]/

## Schema File

File: `path/to/schema.ts`

```[language]
[Database schema file contents]
```

## Additional Important Files

### [file-name.ext]

File: `path/to/file.ext`

```[language]
[Actual file contents]
```

### [another-file.ext]

File: `path/to/another/file.ext`

```[language]
[Actual file contents]
```
```

## Example Usage

```markdown
# Better Auth Todo App Context

Using Better Auth in a Mono Repo with a Hono Server And React Frontend. This is a Open Source Todo list and image store.

## Tech Stack
- TypeScript
- Hono.js (Backend)
- React (Frontend)
- PostgreSQL
- Drizzle ORM
- Better Auth
- TanStack Router
- TanStack Query
- Tailwind CSS

## Project Structure
.
├── apps/
│   ├── server/
│   ├── web-app/
│   └── e2e-tests/
├── packages/
│   └── [none]/
└── ai_docs/

## Schema File

File: `apps/server/src/db/schema.ts`

```typescript
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
// ... rest of schema file contents
```

## Additional Important Files

### auth.ts

File: `apps/server/src/auth.ts`

```typescript
import { betterAuth } from "better-auth";
// ... rest of file contents
```

### auth-client.ts

File: `apps/web-app/src/lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react';
// ... rest of file contents
```
```

## Best Practices

1. **Be Specific**: Only include files that are directly relevant
2. **Use Real Paths**: Include the actual file paths for reference
3. **Full Contents**: Include the complete file contents, not snippets
4. **Language Identifiers**: Always specify the language in code blocks
5. **Minimal Commentary**: Let the code explain itself