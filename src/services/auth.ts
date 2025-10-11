import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  metadata?: Record<string, any>;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export class AuthService {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration for authentication');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // User Registration
  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Registration failed: No user data returned');
    }

    return this.createSession(data.user);
  }

  // User Login
  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Login failed: No user data returned');
    }

    return this.createSession(data.user);
  }

  // Sign out
  async signOut(token?: string): Promise<void> {
    if (token) {
      // If we have a token, we can try to revoke it
      try {
        await this.supabase.auth.signOut();
      } catch (error) {
        console.warn('Error during sign out:', error);
      }
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // First try to verify with our JWT secret
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      if (decoded.userId) {
        // Get user from Supabase
        const { data, error } = await this.supabase.auth.admin.getUserById(decoded.userId);
        
        if (error || !data.user) {
          return null;
        }

        return this.mapSupabaseUser(data.user);
      }

      return null;
    } catch (error) {
      // If JWT verification fails, try Supabase token verification
      try {
        const { data, error } = await this.supabase.auth.getUser(token);
        
        if (error || !data.user) {
          return null;
        }

        return this.mapSupabaseUser(data.user);
      } catch (supabaseError) {
        console.warn('Token verification failed:', error, supabaseError);
        return null;
      }
    }
  }

  // Get current user from session
  async getCurrentUser(token: string): Promise<AuthUser | null> {
    return this.verifyToken(token);
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.user) {
      throw new Error(`Token refresh failed: ${error?.message || 'No user data'}`);
    }

    return this.createSession(data.user);
  }

  // Update user profile
  async updateProfile(userId: string, updates: Record<string, any>): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: updates
    });

    if (error || !data.user) {
      throw new Error(`Profile update failed: ${error?.message || 'No user data'}`);
    }

    return this.mapSupabaseUser(data.user);
  }

  // Change password
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // Admin: List all users
  async listUsers(page: number = 1, perPage: number = 50): Promise<{ users: AuthUser[], total: number }> {
    const { data, error } = await this.supabase.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const users = data.users.map(user => this.mapSupabaseUser(user));
    
    return {
      users,
      total: data.total || users.length
    };
  }

  // Admin: Delete user
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Create session with JWT
  private createSession(user: User): AuthSession {
    const authUser = this.mapSupabaseUser(user);
    
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const expiresAt = new Date();
    
    // Calculate expiration date
    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1));
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1));
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      // Default to 7 days
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.user_metadata?.role || 'user'
      },
      this.jwtSecret
    );

    return {
      user: authUser,
      token,
      expiresAt
    };
  }

  // Map Supabase user to our AuthUser interface
  private mapSupabaseUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user',
      metadata: user.user_metadata
    };
  }

  // Middleware helper for Express
  createAuthMiddleware() {
    return async (req: any, res: any, next: any) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.substring(7);
        const user = await this.verifyToken(token);

        if (!user) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
      }
    };
  }

  // Role-based access control middleware
  createRoleMiddleware(requiredRoles: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }

  // Generate API key for service-to-service communication
  generateApiKey(userId: string, permissions: string[] = []): string {
    return jwt.sign(
      { 
        userId, 
        type: 'api_key',
        permissions,
        iat: Math.floor(Date.now() / 1000)
      },
      this.jwtSecret,
      { expiresIn: '1y' }
    );
  }

  // Verify API key
  async verifyApiKey(apiKey: string): Promise<{ userId: string, permissions: string[] } | null> {
    try {
      const decoded = jwt.verify(apiKey, this.jwtSecret) as any;
      
      if (decoded.type !== 'api_key') {
        return null;
      }

      return {
        userId: decoded.userId,
        permissions: decoded.permissions || []
      };
    } catch (error) {
      return null;
    }
  }
}