import { AuthState } from './types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export class GoogleAuthService {
  private _clientId: string = '';
  private _apiKey: string = '';
  private authState: AuthState = { isSignedIn: false };
  private onAuthChangeCallback?: (authState: AuthState) => void;

  constructor() {
    this.initializeGapi();
  }

  private async initializeGapi(): Promise<void> {
    if (typeof window !== 'undefined' && window.gapi) {
      await new Promise<void>((resolve) => {
        window.gapi.load('auth2', resolve);
      });
    }
  }

  async initialize(apiKey: string, clientId: string): Promise<void> {
    this._apiKey = apiKey;
    this._clientId = clientId;

    if (!window.gapi) {
      throw new Error('Google API library not loaded');
    }

    await window.gapi.load('auth2', async () => {
      try {
        const authInstance = await window.gapi.auth2.init({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets'
        });

        // 현재 인증 상태 확인
        const isSignedIn = authInstance.isSignedIn.get();
        if (isSignedIn) {
          const user = authInstance.currentUser.get();
          this.updateAuthState(user);
        }

        // 인증 상태 변화 감지
        authInstance.isSignedIn.listen((isSignedIn: boolean) => {
          if (isSignedIn) {
            const user = authInstance.currentUser.get();
            this.updateAuthState(user);
          } else {
            this.authState = { isSignedIn: false };
            this.onAuthChangeCallback?.(this.authState);
          }
        });
      } catch (error) {
        console.error('Google Auth initialization failed:', error);
        throw error;
      }
    });
  }

  private updateAuthState(user: any): void {
    const profile = user.getBasicProfile();
    const authResponse = user.getAuthResponse();
    
    this.authState = {
      isSignedIn: true,
      accessToken: authResponse.access_token,
      user: {
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl()
      }
    };
    
    this.onAuthChangeCallback?.(this.authState);
  }

  async signIn(): Promise<void> {
    if (!window.gapi?.auth2) {
      throw new Error('Google Auth not initialized');
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signIn();
  }

  async signOut(): Promise<void> {
    if (!window.gapi?.auth2) {
      throw new Error('Google Auth not initialized');
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  get clientId(): string {
    return this._clientId;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  getAccessToken(): string | undefined {
    return this.authState.accessToken;
  }

  onAuthChange(callback: (authState: AuthState) => void): void {
    this.onAuthChangeCallback = callback;
  }

  isSignedIn(): boolean {
    return this.authState.isSignedIn;
  }
}
