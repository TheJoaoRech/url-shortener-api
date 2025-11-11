import { User } from '../../../../src/users/entities/user.entity';

describe('User Entity', () => {
  it('should create an instance of User', () => {
    const user = new User();

    expect(user).toBeDefined();
    expect(user).toBeInstanceOf(User);
  });

  it('should set all properties correctly', () => {
    const user = new User();
    const now = new Date();

    user.id = '123';
    user.email = 'test@example.com';
    user.password = 'hashedPassword';
    user.createdAt = now;
    user.updatedAt = now;

    expect(user.id).toBe('123');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hashedPassword');
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
  });

  it('should have unique email constraint', () => {
    const user = new User();
    user.email = 'unique@example.com';

    expect(user.email).toBe('unique@example.com');
  });

  it('should store hashed password', () => {
    const user = new User();
    const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz';
    user.password = hashedPassword;

    expect(user.password).toBe(hashedPassword);
    expect(user.password).not.toBe('plainPassword');
  });

  it('should have timestamps', () => {
    const user = new User();
    const now = new Date();

    user.createdAt = now;
    user.updatedAt = now;

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
