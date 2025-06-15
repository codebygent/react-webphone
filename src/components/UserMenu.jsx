import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import ChangeStatusModal from './phone/ChangeStatus';
import { useState } from 'react';

export default function UserMenu() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.userDetails);
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);

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
    {
      key: 'manage-business-number',
      label: <div onClick={() => navigate("/manage/business-number")} className="text-gray-700">Manage Number</div>,
      disabled: false,
    },
    {
      key: 'change-status',
      label: (
        <div
          onClick={() => setShowStatusModal(true)}
          className="text-gray-700"
        >
          Change Status
        </div>
      ),
      disabled: false,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: <div onClick={handleLogout}>Logout</div>,
    },
  ];

  return (
    <div className="absolute p-2 top-0 right-0">
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight" arrow>
        <Avatar
          size="medium"
          icon={<UserOutlined />}
          className="cursor-pointer bg-gray-300 hover:bg-gray-400"
        />
      </Dropdown>
      <ChangeStatusModal open={showStatusModal} onCancel={() => setShowStatusModal(false)} />
    </div>
  );
}
