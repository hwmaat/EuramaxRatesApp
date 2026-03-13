export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface AppError {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  status?: number;
  instance?: string;

  /**
   * Auto dismiss after N milliseconds.
   * If undefined or 0 → no auto-dismiss.
   */
  autoDismissMs?: number;
}

