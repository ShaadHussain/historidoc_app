# Claude Instructions for YouTube Timestamp Bookmarks Extension

Very important - keep the code as simple, organized, and clean as possible. This is for new code, don't do any major refactors without first asking and confirming with me that that's what I actually want.

## Git Commit Guidelines

**IMPORTANT: Make a git commit after EACH change or feature implementation.**

- Commit immediately after completing each change. A change being any code change you make in response to a command I give you.
- Do NOT batch multiple features into one commit
- VERY IMPORTANT - Keep commits small, focused, and atomic. Even if it's just one feature i ask you for, you can and should do multiple commits if the code gets to be significant. You can commit multiple times for one request/feature, I am emphasizing this. I don't want massive commits!
- Use clear, descriptive commit messages that explain what changed
- Follow this format:

  ```
  Brief summary

  - Bullet point details of changes
  - What was added/fixed/improved
  - Why the change was made (if not obvious)

  FEAT_XXXX
  ```

- **DO NOT** include "Generated with Claude Code" or "Co-Authored-By: Claude" in commit messages

## When Making Changes

1. Implement the feature
2. Test it thoroughly
3. **COMMIT IMMEDIATELY**
4. Move to the next feature

Do not wait to batch commits. Commit early, commit often.

Git push often, you can even do it after each change.

## Self-Improvement Loop

After ANY correction from the user: update 'tasks/lessons.md' with the pattern
Write rules for yourself that prevent the same mistake
Ruthlessly iterate on these lessons until mistake rate drops
Review lessons at session start for relevant project

## Important

For new features, assign it a globally unique ID that increments. You can check the git history to see the previous feature ID and increment that by one. For this first feature ID, call it FEAT_100. For the next one, it'd be FEAT_101, so on and so forth.

For each git commit, I want you to put the feature the commit is part of at the very bottom of the commit message after a newline. I want to be able to associate every git commit to a relevant feature. When you start a new feature, add the feature ID with its description to the features.md fiile so I can map the feature ID to what it actually is.
