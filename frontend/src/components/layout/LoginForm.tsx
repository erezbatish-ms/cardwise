import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";

const BACKEND_URL = "/api/auth";

const PROVIDER_CONFIG: Record<string, { label: string; icon: string; bg: string; hover: string }> = {
  google: {
    label: "Google",
    icon: "🔵",
    bg: "bg-white border border-gray-300 text-gray-700",
    hover: "hover:bg-gray-50",
  },
  microsoft: {
    label: "Microsoft",
    icon: "🟦",
    bg: "bg-[#2F2F2F] text-white",
    hover: "hover:bg-[#1a1a1a]",
  },
  facebook: {
    label: "Facebook",
    icon: "🔷",
    bg: "bg-[#1877F2] text-white",
    hover: "hover:bg-[#166FE5]",
  },
};

export function LoginForm() {
  const [providers, setProviders] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("שגיאה בהתחברות. נסה שוב.");
    }
  }, [searchParams]);

  useEffect(() => {
    api.authProviders().then((res) => setProviders(res.providers)).catch(() => {});
  }, []);

  function handleLogin(provider: string) {
    window.location.href = `${BACKEND_URL}/${provider}`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">💳 CardWise</h1>
          <p className="mt-2 text-gray-600">ניתוח חכם של הוצאות כרטיס אשראי</p>
        </div>

        <div className="space-y-3">
          <p className="text-center text-sm font-medium text-gray-700 mb-4">
            התחבר באמצעות
          </p>

          {providers.length === 0 && (
            <div className="text-center text-sm text-gray-400">טוען...</div>
          )}

          {providers.map((provider) => {
            const config = PROVIDER_CONFIG[provider];
            if (!config) return null;
            return (
              <button
                key={provider}
                onClick={() => handleLogin(provider)}
                className={`flex w-full items-center justify-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${config.bg} ${config.hover}`}
              >
                <span className="text-lg">{config.icon}</span>
                <span>התחבר עם {config.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-center text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          המידע שלך מאובטח ומוגן. נשתמש בחשבון שלך רק לצורך זיהוי.
        </div>
      </div>
    </div>
  );
}
