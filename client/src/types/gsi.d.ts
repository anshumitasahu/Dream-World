interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleIdRenderOptions {
  type?: string;
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
  logo_alignment?: string;
  width?: number;
  locale?: string;
}

interface GoogleIdApi {
  initialize(config: GoogleIdConfig): void;
  renderButton(parent: HTMLElement, options: GoogleIdRenderOptions): void;
  prompt(): void;
  disableAutoSelect(): void;
}

interface Google {
  accounts: {
    id: GoogleIdApi;
  };
}

interface Window {
  google?: Google;
}
