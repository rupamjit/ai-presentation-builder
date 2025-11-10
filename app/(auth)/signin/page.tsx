import { GoogleSignInButton } from "../_components/GoogleSignInButton";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Google Sign-In Button*/}
        <GoogleSignInButton />
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
