import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

function getLocaleFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
    const val = cookieStore.get("NEXT_LOCALE")?.value;
    if (val && (routing.locales as readonly string[]).includes(val)) return val;
    return routing.defaultLocale;
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const rawNext = searchParams.get("next") ?? "/dashboard";
    const next = (rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('://'))
        ? rawNext
        : '/dashboard';

    const cookieStore = await cookies();
    const locale = getLocaleFromCookies(cookieStore);

    // Prefix the target path with locale
    const localePath = `/${locale}${next}`;

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${localePath}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${localePath}`);
            } else {
                return NextResponse.redirect(`${origin}${localePath}`);
            }
        }
    }

    return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`);
}
