# Reddit Client

A TypeScript client for interacting with Reddit's API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 Quick Start

### Basic Usage

```ts
import { RedditClient, PasswordGrantAuth } from 'reddit-minimal-client';

const auth = new PasswordGrantAuth({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret', 
  username: 'your-reddit-username',
  password: 'your-reddit-password',
  userAgent: 'MyApp/1.0.0 (by /u/yourusername)'
});

const client = new RedditClient(auth, {
  userAgent: 'MyApp/1.0.0 (by /u/yourusername)'
});

const subreddit = 'your_subreddit_name';

// Fetch latest posts with comments
const posts = await client.getNewestPosts(subreddit, 10);
console.log(`Found ${posts.length} posts`);
```

---

## 🔧 Configuration

### RedditClient Options

```ts
const client = new RedditClient(auth, {
  userAgent: 'MyApp/1.0.0',          // Required: Unique user agent
  maxCommentDepth: 3,                // Optional: Comment nesting depth (default: 3)
  rateLimitMs: 1000,                  // Optional: Rate limit between requests (default: 1000ms)
  timeoutMs: 10000                    // Optional: Request timeout (default: 10s)
});
```

### PasswordGrantAuth Config

```ts
const auth = new PasswordGrantAuth({
  clientId: 'your-app-client-id',        // From Reddit app settings
  clientSecret: 'your-app-secret',       // From Reddit app settings  
  username: 'reddit-username',           // Your Reddit username
  password: 'reddit-password',           // Your Reddit password
  userAgent: 'MyApp/1.0.0 (by /u/you)'   // Unique identifier for your app
});
```

---

## 📊 Data Structure

### RedditPost

```ts
interface RedditPost {
  id: string;                    // Reddit post ID
  title: string;                 // Post title
  selftext: string;              // Post text content
  url: string;                   // Post URL
  created: string;               // ISO date string
  comments: RedditComment[];     // Array of comments
}
```

### RedditComment

```ts
interface RedditComment {
  id: string;          // Comment ID
  parent_id: string;   // Parent comment/post ID
  author: string;      // Author username
  body: string;        // Comment text
  score: number;       // Up/downvotes score
  is_reply: boolean;   // True if reply to comment
}
```
