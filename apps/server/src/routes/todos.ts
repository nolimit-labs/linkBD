import { Hono, MiddlewareHandler } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { subscriptionLimitMiddleware, subscriptionInfoMiddleware, type SubscriptionVariables } from '../middleware/subscription';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator'
import * as todoModel from '../models/todos';
import { generateDownloadURL } from '../lib/storage';
// import { Session } from 'better-auth';

const todoSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageKey: z.string().optional(),
});


const todosRoute = new Hono<{ Variables: AuthVariables & SubscriptionVariables }>()
  // Get all todos for the authenticated user
  .get('/', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');

    const todoList = activeOrganizationId
      ? await todoModel.getOrgTodos(activeOrganizationId)
      : await todoModel.getUserTodos(userId);

    // Map download URLs for todos that have images
    const todosWithImageUrls = await Promise.all(
      todoList.map(async (todo) => ({
        ...todo,
        imageUrl: await generateDownloadURL(todo.imageKey)
      }))
    );

    return c.json(todosWithImageUrls);
  })

  // Create a new todo (with subscription limit check)
  .post('/', authMiddleware, subscriptionLimitMiddleware, zValidator('json', todoSchema), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const body = await c.req.json();

    const created = await todoModel.createTodo({
      userId,
      title: body.title,
      description: body.description,
      imageKey: body.imageKey,
      organizationId: activeOrganizationId,
    });

    return c.json(created, 201);
  })

  // Get a specific todo by ID
  .get('/:id', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');

    const todo = await todoModel.getTodoById(todoId, userId, activeOrganizationId);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    // Add download URL for the image if it exists
    const todoWithImageUrl = {
      ...todo,
      imageUrl: await generateDownloadURL(todo.imageKey)
    };

    return c.json(todoWithImageUrl);
  })

  // Update a todo
  .put('/:id', authMiddleware, zValidator('json', todoSchema), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');
    const body = await c.req.json();

    const updated = await todoModel.updateTodo(todoId, userId, body, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    // Add download URL for the image if it exists
    const updatedWithImageUrl = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey)
    };

    return c.json(updatedWithImageUrl);
  })

  // Toggle todo completion
  .patch('/:id/toggle', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');

    const updated = await todoModel.toggleTodoCompletion(todoId, userId, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(updated);
  })

  // Delete a todo
  .delete('/:id', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');

    const deleted = await todoModel.deleteTodo(todoId, userId, activeOrganizationId);

    if (!deleted) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json({ message: 'Todo deleted successfully' });
  })

  // Update todo image
  .patch('/:id/image', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');
    const { imageKey } = await c.req.json();

    const updated = await todoModel.updateTodoImage(todoId, userId, imageKey, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    // Add download URL for the image if it exists
    const updatedWithImageUrl = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey)
    };

    return c.json(updatedWithImageUrl);
  })

  // Remove todo image
  .delete('/:id/image', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const todoId = c.req.param('id');

    const updated = await todoModel.updateTodoImage(todoId, userId, null, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(updated);
  })

  // Get subscription limits info
  .get('/limits', authMiddleware, subscriptionInfoMiddleware, async (c) => {
    const todoCount = c.get('todoCount');
    const todoLimit = c.get('todoLimit');
    const subscription = c.get('subscription');

    return c.json({
      currentCount: todoCount,
      limit: todoLimit,
      plan: subscription?.plan || 'free',
      remaining: todoLimit - todoCount,
      hasReachedLimit: todoCount >= todoLimit
    });
  });

export default todosRoute;