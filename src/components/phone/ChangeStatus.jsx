import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, Form, message } from 'antd';
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
    const { user, status, setStatus, userStatus, executeAgentAction } = useAuthStore((state) => state);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (userStatus) {
            setStatus(userStatus.status || 'available');
        }
    }, [userStatus, setStatus]);

    const handleChange = (value) => setStatus(value);

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const result = await executeAgentAction(
                values.action,
                user?.extension || '',
                values.extension,
                values.pause,
                values.server
            );
            if (!result.success) {
                message.error(result.message || "Execute agent action error.");
            } else {
                message.success("Agent action executed successfully.");
            }

            onCancel();
        } catch (error) {
            message.error("Operation failed.");
            console.error('Operation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Agent Actions"
            open={open}
            width={400}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okButtonProps={{ className: 'ksk-button' }}
            cancelButtonProps={{ className: 'ksk-button-secondary' }}
            okText="Update"
        >

            <Form form={form} layout="vertical">
                <Form.Item
                    name="action"
                    label="Action"
                    rules={[{ required: true, message: 'Please input the action!' }]}
                >
                    <Input placeholder="Enter action" />
                </Form.Item>
                <Form.Item
                    name="pause"
                    label="Pause"
                >
                    <Input placeholder="Enter pause duration (optional)" />
                </Form.Item>
                <Form.Item
                    name="server"
                    label="Server"
                >
                    <Input placeholder="Enter server (optional)" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangeStatusModal;