import React, { useState } from 'react';
import { Modal, Select, message } from 'antd';
import api from './../../store/axios.config';
import { useAuthStore } from './../../store/authStore';

const { Option } = Select;

const STATUS_OPTIONS = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'away', label: 'Away' },
    { value: 'doNotDisturb', label: 'Do Not Disturb' },
    { value: 'beRightBack', label: 'Be Right Back' },
    { value: 'offline', label: 'Offline' },
];

// Accept open and onCancel as props
const ChangeStatusModal = ({ open, onCancel }) => {
    const {userDetails,status,setStatus} = useAuthStore((state) => state);
    const [loading, setLoading] = useState(false);

    const handleChange = (value) => setStatus(value);

    const handleOk = async () => {
        setLoading(true);
        try {
            const response = await api.post(
                `/vmapi/generictelephonyconnector/saveagentappstatus/`,
                {
                    userId: userDetails?.userId,
                    agentStatus: status
                }
            );
            if (!response.data.success) {
                message.error("Set agent status error.");
            } else {
                message.success("Agent status updated successfully.");
            }
        } catch (error) {
            message.error("Set agent status error.");
            console.error('Set agent status error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Change Agent Status"
            open={open}
            width={300}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Update"
        >
            <Select
                id="agentStatusType"
                value={status}
                onChange={handleChange}
                style={{ width: '100%' }}
            >
                {STATUS_OPTIONS.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
            </Select>
        </Modal>
    );
};

export default ChangeStatusModal;