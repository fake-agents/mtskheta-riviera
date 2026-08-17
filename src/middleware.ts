import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all locale paths but exclude /admin and /api routes
  matcher: ['/', '/(ka|en|ru)/:path*']
};
