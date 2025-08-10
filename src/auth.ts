import axios from "axios";

export interface TokenProvider {
    getToken(): Promise<string>;
  }
  
  export interface PasswordGrantConfig {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    userAgent: string;
  }

  interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type?: string;
  }
  
export class PasswordGrantAuth implements TokenProvider {
    private cached?: { token: string; exp: number };
    
    constructor(private cfg: PasswordGrantConfig) {
      this.validateConfig();
    }
  
    private validateConfig(): void {
      const required = ['clientId', 'clientSecret', 'username', 'password', 'userAgent'];
      for (const field of required) {
        if (!this.cfg[field as keyof PasswordGrantConfig]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }
  
    async getToken(): Promise<string> {
      const now = Date.now();
      if (this.cached && now < this.cached.exp - 30_000) {
        return this.cached.token;
      }
  
      try {
        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", this.cfg.username);
        params.append("password", this.cfg.password);
  
        const res = await axios.post<TokenResponse>(
          "https://www.reddit.com/api/v1/access_token",
          params,
          {
            auth: { username: this.cfg.clientId, password: this.cfg.clientSecret },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": this.cfg.userAgent
            },
            timeout: 10_000
          }
        );
  
        if (!res.data.access_token) {
          throw new Error("No access token in response");
        }
  
        const token = res.data.access_token;
        const expiresIn = res.data.expires_in ?? 3600;
        this.cached = { token, exp: now + expiresIn * 1000 };
        
        return token;
      } catch (error) {
        this.cached = undefined;
        throw new Error(`Failed to obtain access token: ${error}`);
      }
    }
  }