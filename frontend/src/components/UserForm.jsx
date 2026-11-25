import { useState } from 'react';
import FormErrors from './FormErrors.jsx';
import { validateUser } from '../utils/validation.js';
import { getErrorMessage } from '../services/api.js';
import { ROLE_LABELS } from '../utils/format.js';

export default function UserForm({ initial, onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    role: initial?.role || 'MANAGER',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateUser(form, { passwordRequired: !isEdit });
    setErrors(found);
    if (found.length) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors([getErrorMessage(err)]);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormErrors errors={errors} />
      <label>Имя *<input name="name" value={form.name} onChange={change} /></label>
      <label>Email *<input name="email" type="email" value={form.email} onChange={change} /></label>
      <label>Роль *
        <select name="role" value={form.role} onChange={change}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>{isEdit ? 'Новый пароль (необязательно)' : 'Пароль * (минимум 6 символов)'}
        <input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" />
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-light" onClick={onCancel}>Отмена</button>
        <button className="btn" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
      </div>
    </form>
  );
}
