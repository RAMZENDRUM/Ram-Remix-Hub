import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth", // Redirect to this page if not authenticated
    },
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - auth (login page)
         * - api/auth (NextAuth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder content (if any, though usually served statically)
         */
        "/((?!$|auth|api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
