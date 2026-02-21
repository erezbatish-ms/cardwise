import { useState, FormEvent } from "react";
import { api } from "../../lib/api";

export function ScrapeForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("מתחבר לישראכרט ומושך נתונים... זה עשוי לקחת דקה או שתיים");

    try {
      const result = await api.scrape(username, password, startDate || undefined);
      setStatus("success");
      setMessage(result.message);
      // Clear credentials from memory immediately
      setUsername("");
      setPassword("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "שגיאה בסריקה");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 text-2xl font-bold">סריקת נתוני ישראכרט</h2>

      <div className="mb-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        <strong>🔒 אבטחה:</strong> פרטי ההתחברות שלך לא נשמרים בשום מקום.
        הם משמשים רק לסריקה הנוכחית ונמחקים מיד לאחריה.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="scrape-username" className="block text-sm font-medium text-gray-700">
            שם משתמש ישראכרט
          </label>
          <input
            id="scrape-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="scrape-password" className="block text-sm font-medium text-gray-700">
            סיסמת ישראכרט
          </label>
          <input
            id="scrape-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            תאריך התחלה (אופציונלי — ברירת מחדל: 6 חודשים אחורה)
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {message && (
          <div
            role="alert"
            className={`rounded-md p-3 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-700"
                : status === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "loading" ? "⏳ סורק..." : "🔄 התחל סריקה"}
        </button>
      </form>
    </div>
  );
}
