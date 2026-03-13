export interface VersionInfoDto  {
  assemblyVersion: string;
  fileVersion: string;
  informationalVersion?: string | null;
  commitSha?: string | null;         // optional if you later split it server-side
  semanticVersion?: string | null;   // optional if you later split it server-side
};