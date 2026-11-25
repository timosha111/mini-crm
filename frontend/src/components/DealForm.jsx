import { useState } from 'react';
import FormErrors from './FormErrors.jsx';
import { validateDeal } from '../utils/validation.js';
import { getErrorMessage } from '../services/api.js';

export default function DealForm({ initial, clients, managers, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    amount: initial?.amount ?? '',
    clientId: initial?.clientId || '',
    managerId: initial?.managerId || '',
  });
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const found = validateDeal(form);
    setErrors(found);
    if (found.length) return;
    setSaving(true);
    try {
      await onSubmit({
        title: form.title,
        amount: Number(form.amount),
        clientId: Number(form.clientId),
        managerId: form.managerId ? Number(form.managerId) : null,
      });
    } catch (err) {
      setErrors([getErrorMessage(err)]);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <FormErrors errors={errors} />
      <label>Название *<input name="title" value={form.title} onChange={change} /></label>
      <label>Сумма, ₽ *<input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={change} /></label>
      <label>Клиент *
        <select name="clientId" value={form.clientId} onChange={change}>
          <option value="">— выберите клиента —</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>Менеджер
        <select name="managerId" value={form.managerId} onChange={change}>
          <option value="">— не назначен —</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-light" onClick={onCancel}>Отмена</button>
        <button className="btn" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
      </div>
    </form>
  );
}
