import { useState } from 'react';
import FormErrors from './FormErrors.jsx';
import { validateClient } from '../utils/validation.js';
import { getErrorMessage } from '../services/api.js';

export default function ClientForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    company: initial?.company || '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateClient(form); // сначала проверка на клиенте
    setErrors(found);
    if (found.length) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors([getErrorMessage(err)]); // потом ошибки сервера
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormErrors errors={errors} />
      <label>Имя *<input name="name" value={form.name} onChange={change} /></label>
      <label>Телефон *<input name="phone" value={form.phone} onChange={change} /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={change} /></label>
      <label>Компания<input name="company" value={form.company} onChange={change} /></label>
      <div className="form-actions">
        <button type="button" className="btn btn-light" onClick={onCancel}>Отмена</button>
        <button className="btn" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
      </div>
    </form>
  );
}
