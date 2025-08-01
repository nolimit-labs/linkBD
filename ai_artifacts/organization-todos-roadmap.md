# Organization-Based Todos Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Sometimes this roadmap will pivot if i decide to do something differently. IT IS VERY IMPORTANT TO KEEP THIS DOCUMENT UP TO DATE IF I MAKE CHANGES.

## Overview
Enable todos to be created and managed at both personal and organization levels. When a user has an active organization (activeOrganizationId in session), todos should be tied to that organization. Otherwise, todos remain personal. This allows teams to collaborate on shared todos while maintaining personal todo lists.

## Implementation Progress

- [x] Phase 1: Backend Model Updates
- [x] Phase 2: Route Handler Updates  
- [x] Phase 3: Subscription & Middleware Updates
- [x] Phase 4: Frontend API Updates
- [ ] Phase 5: Image Storage Organization Isolation
- [ ] Phase 6: Testing & Validation

## Phase Instructions

### Phase 1: Backend Model Updates
- [x] Update `createTodo` function in `apps/server/src/models/todos.ts`
  ```typescript
  // Add organizationId parameter
  export async function createTodo(
    userId: string, 
    data: { title: string; description?: string; imageKey?: string },
    organizationId?: string | null
  ) {
    // Include organizationId in insert
    const [todo] = await db.insert(todos).values({
      ...data,
      userId,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return todo;
  }
  ```

- [x] Update `getUserTodos` function to only get personal todos
  ```typescript
  export async function getUserTodos(userId: string) {
    // Get personal todos (where organizationId is null)
    return await db.select()
      .from(todos)
      .where(and(
        eq(todos.userId, userId),
        isNull(todos.organizationId)
      ))
      .orderBy(desc(todos.createdAt));
  }
  ```

- [x] Create new `getOrgTodos` function for organization todos
  ```typescript
  export async function getOrgTodos(organizationId: string) {
    // Get organization todos
    return await db.select()
      .from(todos)
      .where(eq(todos.organizationId, organizationId))
      .orderBy(desc(todos.createdAt));
  }
  ```

- [x] Update other todo functions (`getTodoById`, `updateTodo`, `deleteTodo`, `toggleTodoCompletion`, `updateTodoImage`) to validate organization access

### Phase 2: Route Handler Updates
- [x] Update GET `/api/todos` route in `apps/server/src/routes/todos.ts`
  ```typescript
  .get("/", authMiddleware, async (c) => {
    const session = c.get("session");
    const organizationId = session.activeOrganizationId;
    
    const userTodos = organizationId 
      ? await getOrgTodos(organizationId)
      : await getUserTodos(session.userId);
    return c.json(userTodos);
  })
  ```

- [x] Update POST `/api/todos` route to use activeOrganizationId
  ```typescript
  .post("/", authMiddleware, subscriptionMiddleware("todos"), async (c) => {
    const session = c.get("session");
    const organizationId = session.activeOrganizationId;
    const body = await c.req.json();
    
    const todo = await createTodo(session.userId, body, organizationId);
    return c.json(todo, 201);
  })
  ```

- [x] Update PUT/DELETE routes to verify organization access when applicable

### Phase 3: Subscription & Middleware Updates
- [x] Update `subscriptionMiddleware` in `apps/server/src/middleware/subscription.ts` to check organization subscriptions
  ```typescript
  // Check organization subscription if activeOrganizationId exists
  if (session.activeOrganizationId) {
    const orgLimits = await getOrganizationSubscriptionLimits(
      session.activeOrganizationId, 
      feature
    );
    // Validate against organization limits
  } else {
    // Use personal subscription limits
  }
  ```

- [x] Organization validation is handled in model functions (Phase 1)
  ```typescript
  // Ensure user has access to the organization in the todo
  if (todo.organizationId && todo.organizationId !== session.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 403);
  }
  ```

### Phase 4: Frontend API Updates
- [x] Update frontend query keys to differentiate personal vs org todos
  ```typescript
  // in apps/web-app/src/api/query-keys.ts
  todos: {
    all: (organizationId?: string) => 
      organizationId ? ['todos', 'org', organizationId] : ['todos', 'personal'],
    single: (id: string) => ['todos', id],
  }
  ```

- [x] Update `useTodos` hook to refetch when active organization changes
- [x] Add visual indicators in UI to show if todos are personal or organization-based
- [x] Update todo creation to show which context (personal/org) new todos will be created in

### Phase 5: Image Storage Organization Isolation

**Problem**: Currently, images uploaded in organization context may be accessible in personal context and vice versa. Images need to be properly siloed by organization context for security and data isolation.

#### Backend Storage Updates
- [ ] Update storage schema to include organizationId field
  ```sql
  ALTER TABLE storage ADD COLUMN organizationId TEXT REFERENCES organizations(id);
  ```

- [ ] Update file upload logic in `apps/server/src/routes/storage.ts`
  ```typescript
  .post("/upload", authMiddleware, async (c) => {
    const session = c.get("session");
    const organizationId = session.activeOrganizationId;
    
    // Include organizationId in file metadata
    const fileRecord = {
      fileKey,
      userId: session.userId,
      organizationId, // Add organization context
      filename,
      mimeType,
      size
    };
  })
  ```

- [ ] Update file access validation to check organization context
  ```typescript
  // Validate file access based on context
  if (organizationId && file.organizationId !== organizationId) {
    return c.json({ error: "Unauthorized" }, 403);
  }
  if (!organizationId && file.organizationId !== null) {
    return c.json({ error: "Unauthorized" }, 403);
  }
  ```

- [ ] Update file listing to filter by organization context
  ```typescript
  export async function getUserFiles(userId: string, organizationId?: string | null) {
    if (organizationId) {
      // Get organization files
      return await db.select()
        .from(storage)
        .where(eq(storage.organizationId, organizationId));
    }
    // Get personal files (where organizationId is null)
    return await db.select()
      .from(storage)
      .where(and(
        eq(storage.userId, userId),
        isNull(storage.organizationId)
      ));
  }
  ```

#### Storage Path Organization
- [ ] Update Cloudflare R2 storage paths to include organization context
  ```typescript
  // Personal files: users/{userId}/files/{fileKey}
  // Organization files: organizations/{orgId}/files/{fileKey}
  const storagePath = organizationId 
    ? `organizations/${organizationId}/files/${fileKey}`
    : `users/${userId}/files/${fileKey}`;
  ```

#### Migration Strategy
- [ ] Create database migration to add organizationId to existing files
- [ ] Migrate existing files to appropriate storage paths
- [ ] Update file URLs to reflect new organization-based paths

#### Frontend Updates
- [ ] Update file upload hooks to handle organization context
- [ ] Update file listing to show context-appropriate files
- [ ] Ensure image previews only show accessible images

### Phase 6: Testing & Validation
- [ ] Test personal todo creation and retrieval (no active organization)
- [ ] Test organization todo creation and retrieval
- [ ] Test switching between organizations updates todo list
- [ ] Test subscription limits apply correctly for both personal and org contexts
- [ ] Test that users can only access todos from their active organization
- [ ] Update E2E tests to cover organization todo scenarios

## Success Criteria
- Users can create and manage personal todos when no organization is active
- Users can create and manage organization todos when an organization is active
- Todos are properly segregated between personal and organization contexts
- **Images are properly siloed by organization context**
- **Users cannot access images uploaded in different organization contexts**
- **File storage paths reflect organization isolation**
- Subscription limits apply correctly based on context
- Smooth user experience when switching between personal and organization contexts
- No regression in existing personal todo functionality
- Clear visual indicators of todo context in the UI