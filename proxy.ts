import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createIntlMiddleware(routing);

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/opengraph-image" ||
    pathname === "/twitter-image"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes and OAuth callback
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Run next-intl middleware first (handles locale detection, redirects, rewrites)
  const intlResponse = intlMiddleware(request);

  // If intl middleware is redirecting (e.g., bare "/" → "/tr" via Accept-Language),
  // return immediately — auth will run on the subsequent locale-prefixed request
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  // Now run Supabase session refresh on the intl response
  const supabaseResponse = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Strip locale prefix from pathname for route matching
  const localePattern = routing.locales.join("|");
  const localeMatch = pathname.match(new RegExp(`^\\/(${localePattern})(\\/.*)?$`));
  const strippedPath = localeMatch ? (localeMatch[2] || "/") : pathname;
  const locale = localeMatch?.[1] || routing.defaultLocale;

  // Not logged in → redirect to login
  if (!user && strippedPath.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Logged in → redirect away from login page
  if (user && strippedPath === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
