// Type definitions mirroring backend models and API shapes.

/**
 * User interface matching the backend User model
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Not typically included in API responses
  about: string;
  profile_pic: string; // Base64 data URL or silhouette identifier
  friends: string[]; // Array of user IDs
  created_at: string;
  updated_at: string;
}

/**
 * User data for public display (without sensitive fields)
 */
export interface PublicUser {
  id: string;
  username: string;
  email: string;
  about: string;
  profile_pic: string; // Base64 data URL or silhouette identifier
  created_at: string;
}

/**
 * Friend request interface matching the backend FriendRequest model
 */
export interface FriendRequest {
  id: string;
  sender: string; // User ID
  recipient: string; // User ID
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Friend request with populated user data
 */
export interface PopulatedFriendRequest {
  id: string;
  sender: PublicUser;
  recipient: PublicUser;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Authentication request/response types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface ResponseError {
  error: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

/**
 * User update request (for profile updates)
 */
export interface UpdateUserRequest {
  username?: string;
  about?: string;
  profile_pic?: string; // Base64 data URL or silhouette identifier
}

// Alternate API schema using _id (Mongo-style)
export interface UserResponse {
  _id: string;
  username: string;
  email: string;
  about: string;
  profile_pic: string;
  created_at: string;
  updated_at: string;
}

/**
 * Friend management types
 */
export interface SendFriendRequestRequest {
  recipient_id: string;
}

export interface RespondToFriendRequestRequest {
  request_id: string;
  action: 'accept' | 'reject';
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


export interface IncomingRequest {
  _id: string;
  recipient_id: string;
  sender: {
    username: string;
    profile_pic: string;
  }
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OutgoingRequest {
  sender_id: string;
  recipient: {
    _id: string;
    email: string;
    username: string;
    profile_pic: string;
    about: string;
  }
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface FriendRequestsResponse {
  _id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ResponseSuccess {
  message: string;
}