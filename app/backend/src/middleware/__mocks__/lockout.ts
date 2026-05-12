import { vi } from 'vitest';

export const progressiveLockout = () => (_req: any, _res: any, next: any) => next();
export const markLoginFailed = vi.fn();
export const markLoginSuccess = vi.fn();
