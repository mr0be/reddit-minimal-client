export interface RedditComment {
    id: string;
    parent_id: string;
    author: string;
    body: string;
    score: number;
    is_reply: boolean;
  }

  export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    url: string;
    created: string;
    comments: RedditComment[];
  }
  