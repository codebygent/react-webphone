import { Outlet } from 'react-router-dom';
import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { Card } from 'antd';
import * as phone from '../store/uj-phone';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-end">
        <UserMenu />
      </header>
      <main className="flex-1 main-body">
        <div className="flex items-center justify-center bg-gray-50 min-h-[calc(100vh-100px)]">
          <Card className="w-full max-w-[400px] shadow-lg rounded-lg relative jz-card">
            <Outlet />
            <nav className="border-t border-gray-200 mt-4">
              <div className="h-[62px]">
                <ul className="flex items-center justify-around h-full">
                  <li>
                    <NavLink
                      to="/phone"
                      className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    >
                      <i className="fa fa-keyboard-o text-xl mb-1"></i>
                      <span className="text-xs">Keypad</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/todo"
                      className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    >
                      <i className="fa fa-list-alt text-xl mb-1"></i>
                      <span className="text-xs">Todo</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/history"
                      className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    >
                      <i className="fa fa-history text-xl mb-1"></i>
                      <span className="text-xs">History</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/people"
                      className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    >
                      <i className="fa fa-users text-xl mb-1"></i>
                      <span className="text-xs">People</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </nav>
          </Card>
        </div>
      </main>
    </div>
  );
}
