import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // strict admin check for /admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const email = req.nextauth.token?.email;
            if (email !== "ramzendrum@gmail.com") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/profile/:path*"],
};
