import axios from "axios";
import dayjs from "dayjs";
import { RedditComment, RedditPost } from "./types";
import { TokenProvider } from "./auth";
import {backoff,sleep} from "./utils"


interface RedditApiResponse {
  data: {
    children: Array<{
      data: any;
    }>;
  };
}


export interface RedditClientOptions {
  userAgent: string;
  maxCommentDepth?: number;   // default 3
  rateLimitMs?: number;       // default 1000
  timeoutMs?: number;         // default 10000
}

export class RedditClient{
  private readonly depth: number;
   private readonly rateMs: number;
  private readonly timeout: number;

  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly opts: RedditClientOptions
  ) {
    this.depth = opts.maxCommentDepth ?? 3;
    this.rateMs = opts.rateLimitMs ?? 1000;
    this.timeout = opts.timeoutMs ?? 10_000;
  }

  private async authHeaders() {
    const token = await this.tokenProvider.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "User-Agent": this.opts.userAgent
    };
  }


      async getNewestPosts(name: string, limit: number = 100) {
        const safeLimit = Math.min(limit, 100);
        const headers = await this.authHeaders();
        const oneDayAgo = dayjs().subtract(1, "day").unix();
      
        const posts = await this.requestWithRetry(() =>
          axios.get(`https://oauth.reddit.com/r/${name}/new?limit=${safeLimit}`, {
            headers,
            timeout: this.timeout
          })
        );
      
        const postsChildren = posts.data.data.children;
        const results: RedditPost[] = [];

        for(let i = 0; i < postsChildren.length; i++){
          const post = postsChildren[i].data;
          if (!post || post.created_utc < oneDayAgo) continue;
          
          let comments : RedditComment[] = [];
          try{
              const commentRes = await this.fetchComments(post.id);
              comments = this.collectComments(commentRes,0);
          }catch(err){
            console.warn(`Failed to fetch comments for post ${post.id}:`, err);
          }

          
        results.push({
          id: post.id,
          title: post.title,
          selftext: post.selftext || "",
          url: post.url,
          created: dayjs.unix(post.created_utc).format(),
          comments,
        });
        if (i < postsChildren.length - 1) {
          await sleep(this.rateMs);
        }
      }
      return results;
    }

    private async fetchComments(postId: string): Promise<any[]> {
      const headers = await this.authHeaders();
      const res = await this.requestWithRetry(() =>
        axios.get<RedditApiResponse[]>(`https://oauth.reddit.com/comments/${postId}?depth=${this.depth}&limit=100`, {
          headers,
          timeout: this.timeout
        })
      );
      return res.data?.[1]?.data?.children ?? [];
    }

    private collectComments(commentNodes: any[], depth: number): RedditComment[] {
      if (depth > this.depth) return [];
  
      const comments: RedditComment[] = [];
  
      for (const node of commentNodes) {
        const c = node.data;
        if (
          !c ||
          !c.body ||
          c.body === "[deleted]" ||
          c.body === "[removed]"
        ) {
          continue;
        }
  
        const parentId: string = c.parent_id || "";
        const isReply = parentId.startsWith("t1_");
  
        comments.push({
          id: c.id || "",
          parent_id: parentId,
          author: c.author || "unknown",
          body: c.body,
          score: c.score || 0,
          is_reply: isReply,
        });
  
        if (c.replies && c.replies.data?.children?.length > 0) {
          comments.push(...this.collectComments(c.replies.data.children, depth + 1));
        }
      }
  
      return comments;
    }

    private async requestWithRetry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
      let lastErr: unknown;
      
      for (let i = 0; i < max; i++) {
        try {
          return await fn();
        } catch (e: any) {
          lastErr = e;
          const status = e?.response?.status;
          
          if (status === 401 || status === 403 || status === 404) {
            throw e;
          }
          if (status === 429 || (status >= 500 && status < 600) || !status) {
            if (i < max - 1) {
              await sleep(backoff(i));
              continue;
            }
          }
          
          throw e;
        }
      }
      throw lastErr;
    }
}