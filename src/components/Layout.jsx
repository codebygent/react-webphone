import { Outlet } from 'react-router-dom';
import UserMenu from './UserMenu';
import { NavLink } from 'react-router-dom';
import { Card } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faListAlt, faHistory, faUsers } from '@fortawesome/free-solid-svg-icons';
import usePhoneStore from '../store/phone.store';
import logo from '../assets/images/logo.png';

export default function Layout({ showNav = true, showlogo = true, showuser = true }) {

  const { isInCall, isIncomingCall } = usePhoneStore();

  const renderNav = () => (

    <nav className="border-t border-gray-200 mt-4 bottom-nav">
      <div className="h-[52px]">
        <ul className="flex items-center justify-around h-full">
          <li>
            <NavLink
              to="/phone"
              className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : ''}`}
            >
              <FontAwesomeIcon icon={faKeyboard} className="text-xl mb-1" />
              <span className="text-xs">Keypad</span>
            </NavLink>
          </li>
          {/* <li>
                    <NavLink
                      to="/todo"
                      className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : ''}`}
                    >
                      <FontAwesomeIcon icon={faListAlt} className="text-xl mb-1" />
                      <span className="text-xs">Todo</span>
                    </NavLink>
                  </li> */}
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : ''}`}
            >
              <FontAwesomeIcon icon={faHistory} className="text-xl mb-1" />
              <span className="text-xs">History</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/people"
              className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary' : ''}`}
            >
              <FontAwesomeIcon icon={faUsers} className="text-xl mb-1" />
              <span className="text-xs">People</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 main-body font-gotham">
        <div className="flex items-center justify-center min-h-[100vh]">
          <Card className="shadow-lg rounded-lg relative jz-card">
            <div className='pb-[56px] jz-card-body'>
              <header className="p-3">
                <img src={logo} className='mb-2 w-[120px]' />
                {showuser && <UserMenu />}
              </header>
              <Outlet />
            </div>
            {showNav && !isInCall && !isIncomingCall && renderNav()}
          </Card>

        </div>
      </main>
    </div>
  );
}
