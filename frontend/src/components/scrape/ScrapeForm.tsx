import { useState, FormEvent } from "react";
import { api } from "../../lib/api";

export function ScrapeForm() {
  const [idNumber, setIdNumber] = useState("");
  const [card6Digits, setCard6Digits] = useState("");
  const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("מתחבר לישראכרט ומושך נתונים... זה עשוי לקחת דקה או שתיים");

    try {
      const result = await api.scrape(idNumber, card6Digits, password, startDate || undefined);
      setStatus("success");
      setMessage(result.message);
      setIdNumber("");
      setCard6Digits("");
      setPassword("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "שגיאה בסריקה");
    }
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">סריקת נתוני ישראכרט</h2>
        <p className="text-sm text-gray-400">חיבור למשיכת נתוני כרטיס אשראי</p>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-amber-800">
        <span className="text-lg">🔒</span>
        <div>
          <strong>אבטחה:</strong> פרטי ההתחברות שלך לא נשמרים בשום מקום.
          הם משמשים רק לסריקה הנוכחית ונמחקים מיד לאחריה.
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong>אימות:</strong> יש להשתמש בסיסמה הקבועה של ישראכרט (לא SMS).
          ניתן להגדיר סיסמה קבועה באתר ישראכרט תחת הגדרות אבטחה.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-card">
        <div>
          <label htmlFor="scrape-id" className="mb-1.5 block text-sm font-medium text-gray-700">
            תעודת זהות
          </label>
          <input
            id="scrape-id"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5,9}"
            maxLength={9}
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
            className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-blue-300"
            placeholder="מספר תעודת זהות"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="scrape-card6" className="mb-1.5 block text-sm font-medium text-gray-700">
            6 ספרות אחרונות של הכרטיס
          </label>
          <input
            id="scrape-card6"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={card6Digits}
            onChange={(e) => setCard6Digits(e.target.value.replace(/\D/g, ""))}
            className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-blue-300"
            placeholder="6 ספרות אחרונות"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="scrape-password" className="mb-1.5 block text-sm font-medium text-gray-700">
            סיסמה קבועה
          </label>
          <input
            id="scrape-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-blue-300"
            placeholder="הסיסמה הקבועה שלך בישראכרט"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="start-date" className="mb-1.5 block text-sm font-medium text-gray-700">
            תאריך התחלה <span className="text-gray-400 font-normal">(אופציונלי — ברירת מחדל: 6 חודשים אחורה)</span>
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-blue-300"
          />
        </div>

        {message && (
          <div
            role="alert"
            className={`flex items-start gap-2 rounded-xl p-4 text-sm ${
              status === "success"
                ? "border border-emerald-100 bg-emerald-50/50 text-emerald-700"
                : status === "error"
                  ? "border border-red-100 bg-red-50/50 text-red-600"
                  : "border border-blue-100 bg-blue-50/50 text-blue-700"
            }`}
          >
            <span className="text-lg">{status === "success" ? "✅" : status === "error" ? "❌" : "⏳"}</span>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-gradient-to-l from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-card-hover disabled:opacity-50"
        >
          {status === "loading" ? "⏳ סורק..." : "🔄 התחל סריקה"}
        </button>
      </form>
    </div>
  );
}
