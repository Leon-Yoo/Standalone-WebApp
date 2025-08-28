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
  private tokenClient: any;

  constructor() {
    this.initializeGapi();
  }

  private async initializeGapi(): Promise<void> {
    if (typeof window !== 'undefined' && window.gapi) {
      await new Promise<void>((resolve) => {
        window.gapi.load('client', resolve);
      });
    }
  }

  async initialize(apiKey: string, clientId: string): Promise<void> {
    this._apiKey = apiKey;
    this._clientId = clientId;

    if (!window.gapi) {
      throw new Error('Google API library not loaded');
    }

    if (!window.google) {
      throw new Error('Google Identity Services library not loaded');
    }

    try {
      // GAPI 클라이언트 초기화
      await window.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: [
          'https://sheets.googleapis.com/$discovery/rest?version=v4',
          'https://people.googleapis.com/$discovery/rest?version=v1'
        ]
      });

      // Google Identity Services Token Client 초기화
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
          if (response.error) {
            console.error('Token response error:', response.error);
            return;
          }
          
          // 액세스 토큰을 받았을 때 처리
          this.handleTokenResponse(response);
        },
      });

      console.log('Google Auth initialized successfully');
    } catch (error) {
      console.error('Google Auth initialization failed:', error);
      throw error;
    }
  }

  private async handleTokenResponse(response: any): Promise<void> {
    // GAPI 클라이언트에 액세스 토큰 설정
    window.gapi.client.setToken({
      access_token: response.access_token
    });

    try {
      // 사용자 정보 가져오기
      const userInfoResponse = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      const userInfo = userInfoResponse.result;
      
      this.authState = {
        isSignedIn: true,
        accessToken: response.access_token,
        user: {
          name: userInfo.name || 'Google User',
          email: userInfo.email || 'user@gmail.com',
          picture: userInfo.picture || ''
        }
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      // 사용자 정보를 가져올 수 없어도 기본값으로 설정
      this.authState = {
        isSignedIn: true,
        accessToken: response.access_token,
        user: {
          name: 'Google User',
          email: 'user@gmail.com',
          picture: ''
        }
      };
    }
    
    this.onAuthChangeCallback?.(this.authState);
  }

  async signIn(): Promise<void> {
    if (!this.tokenClient) {
      throw new Error('Google Auth not initialized');
    }

    try {
      // 토큰 요청 시작
      this.tokenClient.requestAccessToken({
        prompt: 'consent'
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (this.authState.accessToken) {
      // 토큰 해제
      window.google.accounts.oauth2.revoke(this.authState.accessToken, () => {
        console.log('Token revoked');
      });
    }

    this.authState = { isSignedIn: false };
    this.onAuthChangeCallback?.(this.authState);
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
