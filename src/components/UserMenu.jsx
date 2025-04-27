import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export default function UserMenu() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.userDetails);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'user',
      label: <div className="font-semibold text-gray-700">{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>,
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: <div onClick={handleLogout}>Logout</div>,
    },
  ];

  return (
    <div className="relative">
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight" arrow>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          className="cursor-pointer bg-gray-300 hover:bg-gray-400"
        />
      </Dropdown>
    </div>
  );
}
