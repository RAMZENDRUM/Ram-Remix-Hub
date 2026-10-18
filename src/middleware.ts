import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth",
    },
});

export const config = {
    // Only protect user-specific account routes
    matcher: [
        "/profile/:path*",
        "/admin/:path*",
        "/settings/:path*"
    ]
};
