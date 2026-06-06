// src/pages/auth/AcceptInvite.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@api/axios";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [step, setStep] = useState("verifying"); // verifying | form | success | error
  const [userData, setUserData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Verify token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setErrorMsg(
        "No invite token found. Please use the link from your email.",
      );
      setStep("error");
      return;
    }

    api
      .get(`/invite/verify?token=${token}`)
      .then(({ data }) => {
        if (data.success) {
          setUserData(data.data);
          setStep("form");
        } else {
          setErrorMsg(data.message || "Invalid invite link.");
          setStep("error");
        }
      })
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message ||
            "This invite link is invalid or has expired.",
        );
        setStep("error");
      });
  }, [token]);

  // ── Password strength indicators ─────────────────────────────────────────
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][
    strength
  ];
  const strengthColor = [
    "",
    "#ef4444",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#22c55e",
  ][strength];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!PASSWORD_REGEX.test(password)) {
      setFormError(
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special character (@$!%*?&).",
      );
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/invite/accept", { token, password });
      if (data.success) {
        setStep("success");
      } else {
        setFormError(data.message || "Failed to activate account.");
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render: verifying ─────────────────────────────────────────────────────
  if (step === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="animate-spin w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">
            Verifying your invite link…
          </p>
        </div>
      </div>
    );
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Invite Link Invalid
          </h2>
          <p className="text-slate-500 text-sm">{errorMsg}</p>
          <p className="text-slate-400 text-sm">
            Please contact your manager to resend the invitation.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Render: success ───────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Account Activated!
          </h2>
          <p className="text-slate-500 text-sm">
            Your admin account is ready. You can now log in with your email and
            the password you just set.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/25"
          >
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

  // ── Render: form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
        {/* Logo + header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Set Your Password
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome,{" "}
              <span className="font-semibold text-slate-700">
                {userData?.name}
              </span>
              ! Create a secure password for your admin account.
            </p>
            <p className="text-xs text-slate-400 mt-1">{userData?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 pr-12 border border-slate-200 rounded-2xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition text-sm"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: i <= strength ? strengthColor : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: strengthColor }}
                >
                  {strengthLabel}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  {[
                    { key: "length", label: "At least 8 characters" },
                    { key: "upper", label: "Uppercase letter" },
                    { key: "lower", label: "Lowercase letter" },
                    { key: "number", label: "Number" },
                    { key: "special", label: "Special character (@$!%*?&)" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          checks[key] ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      >
                        {checks[key] && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          checks[key] ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full px-5 py-4 pr-12 border rounded-2xl focus:ring-4 outline-none transition text-sm ${
                  confirm && confirm !== password
                    ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                    : confirm && confirm === password
                    ? "border-emerald-300 focus:border-emerald-300 focus:ring-emerald-100"
                    : "border-slate-200 focus:border-indigo-300 focus:ring-indigo-100"
                }`}
                placeholder="Repeat your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
            {confirm && confirm === password && (
              <p className="text-xs text-emerald-500 mt-1">✓ Passwords match</p>
            )}
          </div>

          {/* Form error */}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              !PASSWORD_REGEX.test(password) ||
              password !== confirm
            }
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Activating…
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
