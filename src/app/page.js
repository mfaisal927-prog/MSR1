"use client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="container center-content">
      <h1 className="brand-title animate-slide-up">
        ملک سجاول<br />ریفریشمنٹ
      </h1>

      <div className="auth-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>لاگ اِن</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">یوزرنیم</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="یوزرنیم درج کریں"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">پاس ورڈ</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="پاس ورڈ درج کریں"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            لاگ اِن
          </button>
        </form>
      </div>
    </div>
  );
}
