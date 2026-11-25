import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../utils/format.js';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    ['/dashboard', 'Dashboard'],
    ['/clients', 'Клиенты'],
    ['/deals', 'Сделки'],
    ...(isAdmin ? [['/users', 'Пользователи']] : []), // раздел виден только ADMIN
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => setOpen(!open)} aria-label="Меню">☰</button>
        <strong>Mini CRM</strong>
      </header>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">Mini CRM</div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>{user.name}</div>
          <small>{ROLE_LABELS[user.role]}</small>
          <button className="btn btn-light" onClick={handleLogout}>Выйти</button>
        </div>
      </aside>

      <main className="content"><Outlet /></main>
    </div>
  );
}
