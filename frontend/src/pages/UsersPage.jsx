import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, formatDate } from '../utils/format.js';
import Modal from '../components/Modal.jsx';
import UserForm from '../components/UserForm.jsx';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(form) {
    const payload = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    if (editing.id) await api.put(`/users/${editing.id}`, payload);
    else await api.post('/users', payload);
    setEditing(null);
    load();
  }

  async function remove(u) {
    if (!window.confirm(`Удалить пользователя «${u.name}»? Его заметки будут удалены, сделки останутся без менеджера.`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <>
      <div className="page-head">
        <h2>Пользователи</h2>
        <button className="btn" onClick={() => setEditing({})}>+ Добавить пользователя</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Имя</th><th>Email</th><th>Роль</th><th>Создан</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.role]}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td className="actions">
                  <button className="btn btn-light btn-sm" onClick={() => setEditing(u)}>Изменить</button>
                  <button className="btn btn-danger btn-sm" disabled={u.id === me.id} onClick={() => remove(u)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Редактирование пользователя' : 'Новый пользователь'} onClose={() => setEditing(null)}>
          <UserForm initial={editing.id ? editing : null} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
