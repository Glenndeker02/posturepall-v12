export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/insights/:path*",
    "/exercises/:path*",
    "/posture/:path*",
    "/calibration/:path*",
    "/breaks/:path*",
    "/analytics/:path*",
  ],
}
