# Comments System Implementation Roadmap

## ✅ V1 COMPLETE - Production Ready

### Implementation Summary
Full-featured commenting system with threaded discussions for linkBD posts. Users and organizations can create, edit, delete comments with single-level nesting (comment + replies).

### API Endpoints
```
GET    /api/posts/:id/comments                    // List comments with pagination
POST   /api/posts/:id/comments                    // Create comment/reply
GET    /api/posts/:postId/comments/:commentId/replies  // Get replies with pagination
PUT    /api/posts/:postId/comments/:commentId          // Update comment
DELETE /api/posts/:postId/comments/:commentId          // Delete comment
```

### Frontend Usage
```tsx
import { CommentsSection } from '@/components/comments'

<CommentsSection postId={postId} />
```

### V1 Phases Completed
- [x] **Phase 1:** Database schema with polymorphic authors
- [x] **Phase 2:** Model layer with CRUD operations & permissions  
- [x] **Phase 3:** RESTful API with auth & validation
- [x] **Phase 4:** React Query hooks with optimistic updates
- [x] **Phase 5:** Comment display components with infinite scroll
- [x] **Phase 6:** Comment creation/editing UI with keyboard shortcuts
- [x] **Phase 6.1:** Post detail route (`/posts/:id`) for viewing & commenting
 - [x] **Phase 6.5:** Mobile App Parity — Implemented comments and replies in the mobile app using unified RPC hooks, a reusable `CommentsList` + `CommentCard`, and a dedicated comment thread route with a sticky bottom composer. Tapping any comment navigates to its thread.



## 📋 V2 ROADMAP - Future Enhancements

### Phase 7: Comment Likes & Reactions
- [ ] Add `commentLikes` table and `likesCount` to comments
- [ ] Create like/unlike API endpoints and hooks
- [ ] Add like button to CommentCard with heart animation
- [ ] Implement optimistic like updates

### Phase 8: Rich Text & Formatting  
- [ ] Basic markdown support (bold, italic, links)
- [ ] Auto-link detection and preview
- [ ] Emoji picker integration
- [ ] Character count and content warnings

### Phase 9: Real-time Features
- [ ] WebSocket integration for live comment updates
- [ ] Real-time comment count updates on post cards
- [ ] Live typing indicators for active commenters
- [ ] Push notifications for comment replies

### Phase 10: Advanced Moderation
- [ ] Comment reporting system
- [ ] Auto-moderation with content filters
- [ ] Post author comment management (pin, hide, delete)
- [ ] Comment thread locking/unlocking

### Phase 11: Performance & Analytics
- [ ] Virtual scrolling for large comment threads
- [ ] Comment search and filtering
- [ ] Analytics dashboard for comment engagement
- [ ] Performance monitoring and optimization

### Phase 12: Social Features
- [ ] @mentions with autocomplete and notifications
- [ ] Comment sharing (copy link, social media)
- [ ] Comment bookmarking/saving
- [ ] Comment threads export (PDF, CSV)

---

## 🚀 Getting Started

### 1. Database Setup
```bash
cd apps/server
npm run db:generate  # Generate migration
npm run db:migrate   # Apply to database
```

### 2. Usage in Your App
```tsx
// In any post detail page
import { CommentsSection } from '@/components/comments'

<CommentsSection postId={post.id} />
```

### 3. Navigation Setup
- Comment button on PostCard now links to `/posts/:id`
- Full post detail page with integrated commenting
- Back navigation and responsive design included

**Status:** ✅ V1 Production Ready | 📋 V2 Planning Phase