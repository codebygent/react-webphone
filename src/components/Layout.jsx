import { Outlet } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-end">
        <UserMenu />
      </header>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
