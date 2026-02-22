# Resona Query Map

## Core Query Map
| Feature | User Action | Query Shape | Models | Index Dependencies | Status |
|---|---|---|---|---|---|
| Auth session load | Open app/dashboard | Read session by token, load user | `Session`, `User` | `Session.sessionToken @unique`, `Session.userId @@index` | Implemented |
| Catalog search | Type in search | External Spotify API search (no DB query) | Spotify API | N/A | Implemented |
| Track detail | Open `/track/[id]` | External Spotify track fetch | Spotify API | N/A | Implemented |
| Album detail | Open `/album/[id]` | External Spotify album fetch | Spotify API | N/A | Implemented |
| Artist detail | Open `/artist/[id]` | External Spotify artist fetch | Spotify API | N/A | Implemented |
| Save track rating | Rate track | Upsert row by `(userId, trackId)` | `UserTrackStat` | `@@id([userId, trackId])`, `@@index([userId])`, `@@index([trackId])` | Planned |
| Save album rating | Rate album | Upsert row by `(userId, albumId)` | `UserAlbumStat` | `@@id([userId, albumId])`, `@@index([userId])`, `@@index([albumId])` | Planned |
| Save artist rating | Rate artist | Upsert row by `(userId, artistId)` | `UserArtistStat` | `@@id([userId, artistId])`, `@@index([userId])`, `@@index([artistId])` | Planned |
| Auto social post | Submit rating | Insert `Post` with entity FK + rating | `Post`, `User`, `Track/Album/Artist` | `Post @@index([userId, createdAt])`, entity FK indexes | Planned |
| Feed load | Open home/dashboard center | Read recent posts + joins for author/entity + counts | `Post`, `User`, `Track/Album/Artist`, `PostLike`, `Comment` | `Post` indexes + `PostLike.postId`, `Comment.postId` | Skeleton |
| Weekly stats | Open right sidebar stats | Count `User*Stat` rows by `userId` and week range | `UserTrackStat`, `UserAlbumStat`, `UserArtistStat` | Add `@@index([userId, createdAt])` to each stats model | Partial |
| Friend activity | Open right sidebar friend activity | Load followed users where `isListening = true`, include current track | `UserFollow`, `User`, `Track`, `TrackArtist`, `Artist` | `UserFollow` composite PK, `User.currentlyPlayingTrackId` FK | Implemented (basic) |
| Follow/unfollow | Click follow toggle | Insert/delete by `(followerId, followingId)` | `UserFollow` | `@@id([followerId, followingId])` | Planned |
| Like post | Click post like | Insert/delete by `(userId, postId)` | `PostLike` | `@@id([userId, postId])`, `@@index([postId])` | Planned |
| Comment on post | Submit comment | Insert comment + list by `postId` | `Comment` | `@@index([postId])`, `@@index([userId])` | Planned |
| Like comment | Click comment like | Insert/delete by `(userId, commentId)` | `CommentLike` | `@@id([userId, commentId])`, `@@index([commentId])` | Planned |
| Taste vector build | Offline analytics run | Read ratings across all `User*Stat` tables | `UserTrackStat`, `UserAlbumStat`, `UserArtistStat` | Existing indexes; may add `@@index([userId, updatedAt])` later | Planned |
| User-user similarity | Offline analytics run | Compute cosine similarity from rating vectors | Source: `User*Stat`; target table TBD | TBD when persistence table is added | Planned |
| Explainable recs | Open recommendations | Read rec rows ordered by score + reason text | Recommendation table(s) TBD | Index on `(userId, score DESC)` in future table | Planned |

### Now (small, high-value)
1. Finalize rating writes for one entity first (`Track`).
2. Validate rating input (`0-10`) server-side.
3. Upsert one `UserTrackStat` row per `(userId, trackId)`.
4. Add optional auto-post creation in same transaction.

### Next
1. Mirror the same pattern for `Album` and `Artist`.
2. Implement feed query with pagination and no N+1 joins.
3. Add composite weekly stats indexes:
   - `UserTrackStat @@index([userId, createdAt])`
   - `UserAlbumStat @@index([userId, createdAt])`
   - `UserArtistStat @@index([userId, createdAt])`

### Later
1. Offline taste vector build job from `User*Stat`.
2. Similarity computation and persisted recommendation table.
3. Explainability surface in UI ("because users with similar ratings liked...").
