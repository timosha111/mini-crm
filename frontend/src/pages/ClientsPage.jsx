import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/Modal.jsx';
import ClientForm from '../components/ClientForm.jsx';

export default function ClientsPage() {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null — окно закрыто, {} — новый клиент, {id,...} — редактирование

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/clients', { params: { search } });
      setClients(data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Небольшая задержка, чтобы не слать запрос на каждую набранную букву
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function save(form) {
    if (editing.id) await api.put(`/clients/${editing.id}`, form);
    else await api.post('/clients', form);
    setEditing(null);
    load();
  }

  async function remove(client) {
    if (!window.confirm(`Удалить клиента «${client.name}» вместе с его сделками и заметками?`)) return;
    try {
      await api.delete(`/clients/${client.id}`);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>Клиенты</h2>
        <button className="btn" onClick={() => setEditing({})}>+ Добавить клиента</button>
      </div>

      <input className="search" placeholder="Поиск по имени, телефону, email, компании…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Имя</th><th>Телефон</th><th>Email</th><th>Компания</th><th>Сделок</th><th></th></tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/clients/${c.id}`}>{c.name}</Link></td>
                <td>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td>{c.company || '—'}</td>
                <td>{c._count.deals}</td>
                <td className="actions">
                  <button className="btn btn-light btn-sm" onClick={() => setEditing(c)}>Изменить</button>
                  {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => remove(c)}>Удалить</button>}
                </td>
              </tr>
            ))}
            {!loading && clients.length === 0 && <tr><td colSpan="6" className="center-text">Клиенты не найдены</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Редактирование клиента' : 'Новый клиент'} onClose={() => setEditing(null)}>
          <ClientForm initial={editing.id ? editing : null} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
