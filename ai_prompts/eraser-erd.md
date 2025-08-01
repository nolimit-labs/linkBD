# Drizzle Schema to Eraser ERD Diagram Prompt

## Prompt:

I need you to convert a Drizzle ORM schema (from a schema.ts file) into an Eraser ERD diagram using their specific syntax. Here are the rules for the conversion:

### Eraser ERD Syntax Rules:

1. **Entity Definition**: 
   ```
   tableName [icon: iconName, color: colorName] {
     fieldName dataType metadata
   }
   ```

2. **Field Types Mapping**:
   - `text()` → `string`
   - `varchar()` → `string`
   - `integer()` → `int`
   - `serial()` → `int`
   - `boolean()` → `boolean`
   - `timestamp()` → `timestamp`
   - `numeric()` → `decimal`

3. **Metadata Indicators**:
   - `.primaryKey()` → add `pk` after the type
   - `.unique()` → add `unique` after the type
   - `.notNull()` → don't add anything (assumed by default)
   - nullable fields → add `nullable` after the type

4. **Relationships**:
   - `.references(() => targetTable.field)` creates a foreign key relationship
   - Use these relationship notations:
     - One-to-many: `childTable.foreignKey > parentTable.primaryKey`
     - Many-to-one: `childTable.foreignKey < parentTable.primaryKey`
     - One-to-one: `childTable.foreignKey - parentTable.primaryKey`
     - Many-to-many: `table1.field <> table2.field`

5. **Icon Selection** (choose appropriate icons based on table name):
   - User-related tables: `[icon: user, color: blue]`
   - Session/auth tables: `[icon: key, color: green]`
   - Financial tables: `[icon: credit-card, color: purple]`
   - General data tables: `[icon: database, color: gray]`
   - Todo/task tables: `[icon: check-circle, color: orange]`
   - File/document tables: `[icon: file, color: cyan]`

6. **Formatting Rules**:
   - Only include the essential fields (id, foreign keys, and 2-3 most important fields per table)
   - Skip timestamp fields unless they're semantically important
   - Skip default/utility fields to keep the diagram clean
   - Group related tables together

### Example Conversion:

**Drizzle Schema:**
```typescript
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  teamId: text("team_id").references(() => team.id)
});

export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull()
});
```

**Eraser ERD Output:**
```
user [icon: user, color: blue] {
  id string pk
  email string unique
  teamId string
}

team [icon: users, color: green] {
  id string pk
  name string
}

user.teamId > team.id
```

Now, please convert the following Drizzle schema to Eraser ERD format, focusing on clarity and the most important relationships:

[PASTE YOUR DRIZZLE SCHEMA HERE]