import { getCookie } from './utils';

describe('getCookie', () => {
  const COOKIE_NAME = 'test_cookie';

  afterEach(() => {
    // Clean up cookies after each test
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it('should return the value of a single cookie', () => {
    document.cookie = `${COOKIE_NAME}=test_value; path=/`;
    expect(getCookie(COOKIE_NAME)).toBe('test_value');
  });

  it('should return the value of a cookie among multiple cookies', () => {
    document.cookie = `other_cookie=other_value; path=/`;
    document.cookie = `${COOKIE_NAME}=test_value; path=/`;
    expect(getCookie(COOKIE_NAME)).toBe('test_value');
  });

  it('should return undefined if the cookie does not exist', () => {
    expect(getCookie('non_existent_cookie')).toBeUndefined();
  });

  it('should handle cookies with empty values', () => {
    document.cookie = `${COOKIE_NAME}=; path=/`;
    expect(getCookie(COOKIE_NAME)).toBe('');
  });

  it('should return undefined for a partially matched cookie name', () => {
    document.cookie = `partial_test_cookie=value; path=/`;
    expect(getCookie(COOKIE_NAME)).toBeUndefined();
  });
});
