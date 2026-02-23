import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const BACKEND_URL = "/api/auth";
const isDev = import.meta.env.DEV;

const ALL_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    bg: "bg-white border border-gray-300 text-gray-700",
    hover: "hover:bg-gray-50",
  },
  {
    id: "microsoft",
    label: "Microsoft",
    icon: "",
    bg: "bg-[#2F2F2F] text-white",
    hover: "hover:bg-[#1a1a1a]",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "",
    bg: "bg-[#1877F2] text-white",
    hover: "hover:bg-[#166FE5]",
  },
];

export function LoginForm() {
  const [error, setError] = useState("");
  const [devLoading, setDevLoading] = useState(false);
  const { isAuthenticated, checkAuth } = useAuth();
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
      const messages: Record<string, string> = {
        google_failed: "ההתחברות עם Google נכשלה. ודא שהספק הוגדר בשרת.",
        microsoft_failed: "ההתחברות עם Microsoft נכשלה. ודא שהספק הוגדר בשרת.",
        facebook_failed: "ההתחברות עם Facebook נכשלה. ודא שהספק הוגדר בשרת.",
        google_not_configured: "ספק Google לא הוגדר בשרת. הגדר GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET.",
        microsoft_not_configured: "ספק Microsoft לא הוגדר בשרת. הגדר MICROSOFT_CLIENT_ID ו-MICROSOFT_CLIENT_SECRET.",
        facebook_not_configured: "ספק Facebook לא הוגדר בשרת. הגדר FACEBOOK_CLIENT_ID ו-FACEBOOK_CLIENT_SECRET.",
      };
      setError(messages[errorParam] || "שגיאה בהתחברות. נסה שוב.");
    }
  }, [searchParams]);

  function handleLogin(providerId: string) {
    window.location.href = `${BACKEND_URL}/${providerId}`;
  }

  async function handleDevLogin() {
    setDevLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/test-login`, { method: "POST", credentials: "include" });
      if (res.ok) {
        await checkAuth();
        navigate("/", { replace: true });
      } else {
        setError("התחברות פיתוח נכשלה");
      }
    } catch {
      setError("שגיאה בהתחברות לשרת");
    } finally {
      setDevLoading(false);
    }
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
            התחבר או הרשם באמצעות
          </p>

          {ALL_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleLogin(provider.id)}
              className={`flex w-full items-center justify-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${provider.bg} ${provider.hover}`}
            >
              {provider.icon ? (
                <img src={provider.icon} alt="" className="h-5 w-5" />
              ) : (
                <span className="text-lg">{provider.id === "microsoft" ? "⊞" : "f"}</span>
              )}
              <span>התחבר עם {provider.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-center text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          לחיצה על אחד הכפתורים תפנה אותך לדף ההתחברות של הספק.
          <br />
          משתמש חדש? ההרשמה מתבצעת אוטומטית בהתחברות הראשונה.
        </p>

        {isDev && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="mb-2 text-center text-xs text-amber-600">⚠️ סביבת פיתוח</p>
            <button
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              {devLoading ? "מתחבר..." : "🔧 התחבר כמשתמש פיתוח"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
