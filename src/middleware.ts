import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth", // Redirect to login page if detection fails
    },
});

export const config = {
    // Only protect these specific routes
    matcher: [
        "/profile/:path*",
        "/releases/:path*",
        "/playlists/:path*",
        "/remix/:path*",
        "/admin/:path*",
        "/settings/:path*"
    ]
};
