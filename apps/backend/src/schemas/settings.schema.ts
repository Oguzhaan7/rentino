// Simple TypeScript interfaces for settings - no external dependencies

export interface UserSettings {
  language: string;
  theme: "light" | "dark";
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
  dashboard: {
    showWelcome: boolean;
    compactMode: boolean;
  };
}

export interface UpdateSettingsBody {
  language?: string;
  theme?: "light" | "dark";
  timezone?: string;
  notifications?: {
    email?: boolean;
    browser?: boolean;
    sms?: boolean;
  };
  dashboard?: {
    showWelcome?: boolean;
    compactMode?: boolean;
  };
}
