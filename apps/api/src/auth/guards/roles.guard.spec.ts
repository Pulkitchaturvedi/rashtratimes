import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  function createContext(role?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined })
      }),
      getHandler: () => undefined,
      getClass: () => undefined
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext('REPORTER'))).toBe(true);
  });

  it('throws when user missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['EDITOR']);
    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });

  it('throws when role mismatched', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['EDITOR']);
    expect(() => guard.canActivate(createContext('REPORTER'))).toThrow(ForbiddenException);
  });

  it('allows matching role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['REPORTER']);
    expect(guard.canActivate(createContext('REPORTER'))).toBe(true);
  });
});
