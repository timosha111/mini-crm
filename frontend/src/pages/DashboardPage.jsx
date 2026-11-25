import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { STATUS_LABELS, STATUS_ORDER, formatMoney } from '../utils/format.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data)).catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p className="center-text">Загрузка…</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="grid grid-3">
        <div className="card stat"><span className="muted">Клиентов</span><strong>{data.clients}</strong></div>
        <div className="card stat"><span className="muted">Сделок</span><strong>{data.deals.count}</strong></div>
        <div className="card stat"><span className="muted">Общая сумма сделок</span><strong>{formatMoney(data.deals.totalAmount)}</strong></div>
      </div>

      <h3>Сделки по статусам</h3>
      <div className="grid grid-4">
        {STATUS_ORDER.map((s) => (
          <div key={s} className={`card stat stat-${s}`}>
            <span className="muted">{STATUS_LABELS[s]}</span>
            <strong>{data.byStatus[s].count}</strong>
            <span>{formatMoney(data.byStatus[s].amount)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
