export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string | null;
  coverURL?: string | null;
  createdAt: string;
  role: string;
  plan?: string;
  subscriptionPlan?: string;
  copilotRequestCount?: number;
  lastCopilotRequestDate?: any;
}

// Module-level in-memory cache to share user data across hook instances and contexts
export const cachedUserData: { [uid: string]: UserData } = {};
export const activeUserDataPromises: { [uid: string]: Promise<UserData | null> } = {};
