import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import { validateLogin } from '../utils/validation.js';
import FormErrors from '../components/FormErrors.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />; // уже вошли

  async function submit(e) {
    e.preventDefault();
    const found = validateLogin(form);
    setErrors(found);
    if (found.length) return;
    setLoading(true);
    try {
      await login(form.email, form.password); // после успеха user появится и сработает Navigate выше
    } catch (err) {
      setErrors([getErrorMessage(err)]);
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={submit} noValidate>
        <h1>Mini CRM</h1>
        <p className="muted">Войдите в систему</p>
        <FormErrors errors={errors} />
        <label>Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
        </label>
        <label>Пароль
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn btn-block" disabled={loading}>{loading ? 'Вход…' : 'Войти'}</button>
        <p className="muted small">Тест: admin@example.com / admin123, manager@example.com / manager123</p>
      </form>
    </div>
  );
}
