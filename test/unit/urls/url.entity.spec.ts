import { Url } from '../../../src/urls/entities/url.entity';
import { User } from '../../../src/users/entities/user.entity';

describe('Url Entity', () => {
  it('should create an instance of Url', () => {
    const url = new Url();

    expect(url).toBeDefined();
    expect(url).toBeInstanceOf(Url);
  });

  it('should set all properties correctly', () => {
    const url = new Url();
    const now = new Date();

    url.id = '123';
    url.originalUrl = 'https://example.com';
    url.shortCode = 'abc123';
    url.userId = 'user-123';
    url.clickCount = 5;
    url.createdAt = now;
    url.updatedAt = now;
    url.deletedAt = null;

    expect(url.id).toBe('123');
    expect(url.originalUrl).toBe('https://example.com');
    expect(url.shortCode).toBe('abc123');
    expect(url.userId).toBe('user-123');
    expect(url.clickCount).toBe(5);
    expect(url.createdAt).toBe(now);
    expect(url.updatedAt).toBe(now);
    expect(url.deletedAt).toBeNull();
  });

  it('should allow null userId for anonymous URLs', () => {
    const url = new Url();
    url.userId = null;

    expect(url.userId).toBeNull();
  });

  it('should have user property for ManyToOne relationship', () => {
    const url = new Url();
    const user = new User();
    user.id = 'user-123';
    user.email = 'test@example.com';

    url.user = user;

    expect(url.user).toBeDefined();
    expect(url.user).toBeInstanceOf(User);
    expect(url.user.id).toBe('user-123');
  });

  it('should allow null user for anonymous URLs', () => {
    const url = new Url();
    url.user = null;

    expect(url.user).toBeNull();
  });

  it('should handle soft delete with deletedAt', () => {
    const url = new Url();
    const deletedDate = new Date();

    url.deletedAt = deletedDate;

    expect(url.deletedAt).toBe(deletedDate);
  });

  it('should initialize with default clickCount of 0', () => {
    const url = new Url();
    url.clickCount = 0;

    expect(url.clickCount).toBe(0);
  });

  it('should increment clickCount', () => {
    const url = new Url();
    url.clickCount = 0;

    url.clickCount++;
    url.clickCount++;

    expect(url.clickCount).toBe(2);
  });

  it('should maintain relationship between URL and User', () => {
    const url = new Url();
    const user = new User();

    user.id = 'user-456';
    user.email = 'owner@example.com';
    user.password = 'hashedPassword';

    url.id = 'url-123';
    url.shortCode = 'abc456';
    url.originalUrl = 'https://test.com';
    url.userId = user.id;
    url.user = user;

    expect(url.userId).toBe(user.id);
    expect(url.user).toBe(user);
    expect(url.user.email).toBe('owner@example.com');
  });

  it('should handle URL without user relationship', () => {
    const url = new Url();

    url.id = 'url-789';
    url.shortCode = 'xyz123';
    url.originalUrl = 'https://anonymous.com';
    url.userId = null;
    url.user = null;

    expect(url.userId).toBeNull();
    expect(url.user).toBeNull();
  });
});
