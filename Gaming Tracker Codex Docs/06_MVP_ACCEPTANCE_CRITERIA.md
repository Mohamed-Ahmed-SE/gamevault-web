# MVP Acceptance Criteria

The MVP is not complete until all required flows work.

## Authentication
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Protected user data is inaccessible to other users

## Homepage
- [ ] Cinematic hero renders correctly
- [ ] Trending rail works
- [ ] Recent releases rail works
- [ ] Upcoming rail works
- [ ] Continue Playing works for logged-in users
- [ ] Backlog works for logged-in users
- [ ] Favorites works for logged-in users
- [ ] PS2 Classics is visible
- [ ] PS3 Classics is visible

## Discover
- [ ] User can browse games
- [ ] User can filter by platform
- [ ] User can directly browse PS2
- [ ] User can directly browse PS3
- [ ] User can filter by genre
- [ ] User can sort results
- [ ] URL reflects active filters

## Search
- [ ] Search is debounced
- [ ] Search returns useful game cards
- [ ] User can combine search + platform
- [ ] Empty and error states exist

## Game details
- [ ] Hero renders
- [ ] Metadata renders
- [ ] Add to library works
- [ ] Status change works
- [ ] Favorite toggle works
- [ ] Personal notes can be saved
- [ ] Playtime can be entered
- [ ] Detailed ratings can be saved
- [ ] Gameplay score works
- [ ] Story score works
- [ ] Graphics score works
- [ ] Sound score works
- [ ] Overall score works
- [ ] Trailer section renders when media exists
- [ ] Missing trailer state is graceful
- [ ] Screenshot gallery works
- [ ] Gallery lightbox works
- [ ] Achievements section works when data exists
- [ ] Requirements render for PC games when available
- [ ] Similar games render

## Library
- [ ] All tab
- [ ] Want to Play tab
- [ ] Backlog tab
- [ ] Playing tab
- [ ] Completed tab
- [ ] Paused tab
- [ ] Dropped tab
- [ ] Favorites tab
- [ ] Search/filter inside library
- [ ] Sort works

## Profile
- [ ] Favorite games shown
- [ ] Highest-rated games shown
- [ ] XP shown
- [ ] Level shown
- [ ] Playing count shown
- [ ] Completed count shown
- [ ] Backlog count shown
- [ ] Total tracked playtime shown

## Completion model
- [ ] There is no `100% completed` status
- [ ] There is no separate `complete` vs `completed 100%` state
- [ ] `completed` is the only completion status

## Quality
- [ ] Responsive at mobile/tablet/desktop widths
- [ ] Keyboard navigation works for key controls
- [ ] Focus states are visible
- [ ] Reduced motion respected
- [ ] Images are optimized
- [ ] Heavy media lazy loads
- [ ] No exposed private API secrets
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Production build passes
