export const authenticate = (req: any, _res: any, next: any) => {
  req.user = { id: 'test-user-id', email: 'test@simply-gmao.fr', role: 'RESPONSABLE', firstName: 'Test', lastName: 'User' };
  next();
};

export const authorize = () => (_req: any, _res: any, next: any) => next();
export const optionalAuthenticate = (_req: any, _res: any, next: any) => next();
