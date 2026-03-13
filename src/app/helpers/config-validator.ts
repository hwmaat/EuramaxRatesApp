import { IAppConfig } from '../models/app-config.model';

export function validateConfig(config: IAppConfig): void {
  const requiredKeys: (keyof IAppConfig)[] = [
    'apiBaseUrl',
    'appBaseUrl',
    'authPingEndpoint',
    'client',
    'title',
    'backgroundImage',
    'logo',
    'theme',
    'version',
    'defaultBaanAdministration',
    'apiKey'
  ];

  const missing = requiredKeys.filter(
    (key) => config[key] === undefined || config[key] === ''
  );

  if (missing.length > 0) {
    console.error('❌ Configuration missing keys:', missing);
    throw new Error(`Configuration invalid. Missing: ${missing.join(', ')}`);
  }
}
