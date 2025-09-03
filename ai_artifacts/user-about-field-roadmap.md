# User About Field Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Add an "About" field to user profiles to allow users to write a brief description about themselves, similar to how organizations have descriptions. This will enhance user profiles and provide more context about community members.

## Implementation Progress

- [x] Phase 1: Database Schema Update
- [x] Phase 2: Backend API Updates  
- [x] Phase 3: Frontend Profile Updates
- [ ] Phase 4: Migration & Testing

## Phase Instructions

### Phase 1: Database Schema Update
- [x] Add `description` field to `user` table in schema.ts
- [x] Generate migration with `npm run db:generate` 
- [x] Review generated migration SQL for correctness
- [x] Apply migration with `npm run db:migrate`

### Phase 2: Backend API Updates
- [x] Update user profile GET endpoint to include description field (already returns all fields)
- [x] Update user profile PUT endpoint to accept description (added validation schema)
- [x] Update user model functions to handle description (updated updateUser function)

### Phase 3: Frontend Profile Updates
- [x] Update ProfileCard component to show About section for users (already done - it shows when description exists)
- [x] Update ProfileCard edit mode to allow editing About for users (already done - textarea shows in edit mode)
- [x] Update useUpdateUser hook to include description field
- [x] Update ProfileCard handleSave to include description for users
- [x] Add character limit indicator for description (500 chars)
- [ ] Consider adding markdown support for descriptions (future enhancement)

### Phase 4: Migration & Testing
- [ ] Create data migration script if needed for existing users
- [ ] Test user profile view with description
- [ ] Test user profile edit with description
- [ ] Test organization profile (ensure no regression)
- [ ] Test character limits and validation
- [ ] Test image upload still works with description
- [ ] Update any user profile documentation

## Success Criteria
- Users can add/edit an "About" section on their profile
- About section displays properly on user profile pages
- Character limit of 500 characters is enforced
- Description persists correctly in database
- No regression in organization profiles
- Edit mode works seamlessly for both users and organizations
- Mobile responsive design maintained

## Additional Considerations
- Consider rich text/markdown support in future phases
- Consider privacy settings for who can see descriptions
- Consider adding social links field in future
- Consider adding location field for diaspora context

## Notes
- Frontend UI already supports description field for users (ProfileCard component is generic)
- Only backend schema and API updates needed to enable for users
- Keep consistent 500 character limit between users and organizations