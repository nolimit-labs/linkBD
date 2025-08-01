# TodoApp ERD Diagram (Eraser Format)

Based on the schema at `apps/server/src/db/schema.ts`, here's the ERD diagram in Eraser syntax:

```
user [icon: user, color: blue] {
  id string pk
  name string
  email string unique
  emailVerified boolean
  image string nullable
  createdAt timestamp
  updatedAt timestamp
  isAnonymous boolean nullable
  stripeCustomerId string nullable
}

session [icon: key, color: green] {
  id string pk
  expiresAt timestamp
  token string unique
  createdAt timestamp
  updatedAt timestamp
  ipAddress string nullable
  userAgent string nullable
  userId string
  activeOrganizationId string nullable
}

account [icon: shield, color: green] {
  id string pk
  accountId string
  providerId string
  userId string
  accessToken string nullable
  refreshToken string nullable
  idToken string nullable
  accessTokenExpiresAt timestamp nullable
  refreshTokenExpiresAt timestamp nullable
  scope string nullable
  password string nullable
  createdAt timestamp
  updatedAt timestamp
}

verification [icon: mail, color: yellow] {
  id string pk
  identifier string
  value string
  expiresAt timestamp
  createdAt timestamp nullable
  updatedAt timestamp nullable
}

organization [icon: building, color: indigo] {
  id string pk
  name string
  slug string unique nullable
  logo string nullable
  createdAt timestamp
  metadata string nullable
}

member [icon: users, color: teal] {
  id string pk
  organizationId string
  userId string
  role string
  createdAt timestamp
}

invitation [icon: mail-plus, color: pink] {
  id string pk
  organizationId string
  email string
  role string nullable
  status string
  expiresAt timestamp
  inviterId string
}

subscription [icon: credit-card, color: purple] {
  id string pk
  plan string
  referenceId string
  stripeCustomerId string nullable
  stripeSubscriptionId string nullable
  status string nullable
  periodStart timestamp nullable
  periodEnd timestamp nullable
  cancelAtPeriodEnd boolean nullable
  seats integer nullable
}

todos [icon: check-circle, color: orange] {
  id string pk
  userId string
  organizationId string nullable
  title string
  description string nullable
  imageKey string nullable
  completed boolean
  createdAt timestamp
  updatedAt timestamp
}

// Relationships
session.userId > user.id
session.activeOrganizationId > organization.id
account.userId > user.id
member.organizationId > organization.id
member.userId > user.id
invitation.organizationId > organization.id
invitation.inviterId > user.id
todos.userId > user.id
todos.organizationId > organization.id
subscription.referenceId > user.id
subscription.referenceId > organization.id
```

This ERD shows:
- **Authentication tables**: user, session, account, verification (Better Auth core)
- **Organization tables**: organization, member, invitation (multi-tenant support, Better Auth Organization plugin)
- **Subscription/billing table**: subscription (references both users and organizations, Better Auth Stripe plugin)
- **Application tables**: todos (supports both personal and organization todos)
- **Key relationships**:
  - Users can belong to multiple organizations via member table
  - Todos can be personal (userId) or organizational (organizationId)
  - Subscriptions can be attached to users or organizations via referenceId
  - Sessions track active organization context