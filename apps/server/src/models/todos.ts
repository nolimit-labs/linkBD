import { db } from '../db';
import { todos } from '../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

export async function getTodosByUserId(userId: string) {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
}

export async function getUserTodos(userId: string) {
  // Get personal todos (where organizationId is null)
  return await db
    .select()
    .from(todos)
    .where(and(
      eq(todos.userId, userId),
      isNull(todos.organizationId)
    ))
    .orderBy(desc(todos.createdAt));
}

export async function getOrgTodos(organizationId: string) {
  // Get organization todos
  return await db
    .select()
    .from(todos)
    .where(eq(todos.organizationId, organizationId))
    .orderBy(desc(todos.createdAt));
}

export async function getTodoById(todoId: string, userId: string, organizationId?: string | null) {
  const results = await db
    .select()
    .from(todos)
    .where(eq(todos.id, todoId));
  
  const todo = results[0];
  if (!todo) return null;
  
  // Validate access: either personal todo for the user or organization todo for active org
  if (organizationId && todo.organizationId === organizationId) {
    return todo; // Organization todo access
  } else if (!organizationId && todo.organizationId === null && todo.userId === userId) {
    return todo; // Personal todo access
  }
  
  return null; // No access
}

export async function createTodo(data: {
  userId: string;
  title: string;
  description?: string;
  imageKey?: string;
  organizationId?: string | null;
}) {
  const newTodo = {
    id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    title: data.title,
    description: data.description,
    imageKey: data.imageKey,
    completed: false,
    organizationId: data.organizationId,
  };
  
  const [created] = await db.insert(todos).values(newTodo).returning();
  return created;
}

export async function updateTodo(todoId: string, userId: string, data: {
  title?: string;
  description?: string;
  completed?: boolean;
  imageKey?: string;
}, organizationId?: string | null) {
  // Verify ownership/access first
  const existing = await getTodoById(todoId, userId, organizationId);
  if (!existing) {
    return null;
  }

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };
  
  const [updated] = await db
    .update(todos)
    .set(updateData)
    .where(eq(todos.id, todoId))
    .returning();
  
  return updated;
}

export async function toggleTodoCompletion(todoId: string, userId: string, organizationId?: string | null) {
  // Get the current todo
  const existingTodo = await getTodoById(todoId, userId, organizationId);
  if (!existingTodo) {
    return null;
  }
  
  const [updated] = await db
    .update(todos)
    .set({
      completed: !existingTodo.completed,
      updatedAt: new Date(),
    })
    .where(eq(todos.id, todoId))
    .returning();
  
  return updated;
}

export async function deleteTodo(todoId: string, userId: string, organizationId?: string | null) {
  // Verify ownership/access first
  const existing = await getTodoById(todoId, userId, organizationId);
  if (!existing) {
    return false;
  }
  
  await db.delete(todos).where(eq(todos.id, todoId));
  return true;
}

export async function updateTodoImage(todoId: string, userId: string, imageKey: string | null, organizationId?: string | null) {
  // Verify ownership/access first
  const existing = await getTodoById(todoId, userId, organizationId);
  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(todos)
    .set({
      imageKey: imageKey,
      updatedAt: new Date(),
    })
    .where(eq(todos.id, todoId))
    .returning();
  
  return updated;
}