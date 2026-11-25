import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatMoney } from '../utils/format.js';
import { validateNote } from '../utils/validation.js';
import StatusBadge from '../components/StatusBadge.jsx';
import FormErrors from '../components/FormErrors.jsx';

export default function ClientDetailsPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [noteErrors, setNoteErrors] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/clients/${id}`);
      setClient(data);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addNote(e) {
    e.preventDefault();
    const found = validateNote(text);
    setNoteErrors(found);
    if (found.length) return;
    try {
      await api.post(`/clients/${id}/notes`, { text });
      setText('');
      load();
    } catch (err) {
      setNoteErrors([getErrorMessage(err)]);
    }
  }

  async function deleteNote(noteId) {
    if (!window.confirm('Удалить заметку?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (error) return <><div className="alert alert-error">{error}</div><Link to="/clients">← К списку клиентов</Link></>;
  if (!client) return <p className="center-text">Загрузка…</p>;

  return (
    <>
      <Link to="/clients">← К списку клиентов</Link>
      <h2>{client.name}</h2>

      <div className="card info-grid">
        <div><span className="muted">Телефон</span><div>{client.phone}</div></div>
        <div><span className="muted">Email</span><div>{client.email || '—'}</div></div>
        <div><span className="muted">Компания</span><div>{client.company || '—'}</div></div>
        <div><span className="muted">Создан</span><div>{formatDate(client.createdAt)}</div></div>
      </div>

      <h3>Сделки клиента</h3>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Название</th><th>Сумма</th><th>Статус</th><th>Менеджер</th></tr></thead>
          <tbody>
            {client.deals.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td><td>{formatMoney(d.amount)}</td>
                <td><StatusBadge status={d.status} /></td><td>{d.manager?.name || '—'}</td>
              </tr>
            ))}
            {client.deals.length === 0 && <tr><td colSpan="4" className="center-text">Сделок пока нет</td></tr>}
          </tbody>
        </table>
      </div>

      <h3>Заметки</h3>
      <form className="card" onSubmit={addNote} noValidate>
        <FormErrors errors={noteErrors} />
        <label>Новая заметка
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <button className="btn">Добавить заметку</button>
      </form>

      {client.notes.map((n) => (
        <div className="card note" key={n.id}>
          <div className="note-head">
            <span><strong>{n.author.name}</strong> · <span className="muted">{formatDate(n.createdAt)}</span></span>
            {(isAdmin || n.author.id === user.id) && (
              <button className="btn btn-danger btn-sm" onClick={() => deleteNote(n.id)}>Удалить</button>
            )}
          </div>
          <p>{n.text}</p>
        </div>
      ))}
      {client.notes.length === 0 && <p className="muted">Заметок пока нет</p>}
    </>
  );
}
