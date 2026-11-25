import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { STATUS_LABELS, STATUS_ORDER, STATUS_TRANSITIONS, formatMoney } from '../utils/format.js';
import Modal from '../components/Modal.jsx';
import DealForm from '../components/DealForm.jsx';

export default function DealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', managerId: '' });
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  // Справочники для формы и фильтра
  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/users/options')])
      .then(([c, m]) => { setClients(c.data); setManagers(m.data); })
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  const load = useCallback(async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v)); // только заполненные фильтры
    try {
      const { data } = await api.get('/deals', { params });
      setDeals(data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function save(payload) {
    if (editing.id) await api.put(`/deals/${editing.id}`, payload);
    else await api.post('/deals', payload);
    setEditing(null);
    load();
  }

  async function changeStatus(deal, status) {
    try {
      await api.patch(`/deals/${deal.id}/status`, { status });
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function remove(deal) {
    if (!window.confirm(`Удалить сделку «${deal.title}»?`)) return;
    try {
      await api.delete(`/deals/${deal.id}`);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  const setFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h2>Сделки</h2>
        <button className="btn" onClick={() => setEditing({ managerId: user.id })}>+ Новая сделка</button>
      </div>

      <div className="filters">
        <input name="search" placeholder="Поиск по названию…" value={filters.search} onChange={setFilter} />
        <select name="status" value={filters.status} onChange={setFilter}>
          <option value="">Все статусы</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select name="managerId" value={filters.managerId} onChange={setFilter}>
          <option value="">Все менеджеры</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Воронка продаж: колонки-статусы слева направо */}
      <div className="funnel">
        {STATUS_ORDER.map((status) => {
          const column = deals.filter((d) => d.status === status);
          const sum = column.reduce((acc, d) => acc + d.amount, 0);
          return (
            <section key={status} className={`column column-${status}`}>
              <header>
                <strong>{STATUS_LABELS[status]}</strong>
                <span className="muted">{column.length} · {formatMoney(sum)}</span>
              </header>
              {column.map((d) => (
                <article className="card deal" key={d.id}>
                  <h4>{d.title}</h4>
                  <Link to={`/clients/${d.client.id}`}>{d.client.name}</Link>
                  <div className="deal-amount">{formatMoney(d.amount)}</div>
                  <small className="muted">Менеджер: {d.manager?.name || 'не назначен'}</small>
                  <div className="deal-actions">
                    {STATUS_TRANSITIONS[d.status].map((next) => (
                      <button key={next} className={`btn btn-sm ${next === 'LOST' ? 'btn-danger' : ''}`} onClick={() => changeStatus(d, next)}>
                        → {STATUS_LABELS[next]}
                      </button>
                    ))}
                    <button className="btn btn-light btn-sm" onClick={() => setEditing(d)}>Изменить</button>
                    <button className="btn btn-light btn-sm" onClick={() => remove(d)}>Удалить</button>
                  </div>
                </article>
              ))}
              {column.length === 0 && <p className="muted small">Нет сделок</p>}
            </section>
          );
        })}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Редактирование сделки' : 'Новая сделка'} onClose={() => setEditing(null)}>
          <DealForm initial={editing} clients={clients} managers={managers} onSubmit={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
