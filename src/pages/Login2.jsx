import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { showSuccess ,showError} from '../components/helpers/notifications';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState(null); // 'email' or 'mobile'
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPinField, setShowPinField] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  
  const { 
    checkEmailPreLogin, 
    loginWithEmailPassword, 
    sendPinCode,
    loginWithMobilePincode 
  } = useAuthStore();
  const navigate = useNavigate();

  const handleEmailPreLogin = async (values) => {
    setLoading(true);
    try {
      const result = await checkEmailPreLogin(values.email);
      if (result.success) {
        setEmail(values.email);
        setShowPasswordField(true);
      } else {
        showError(result.message || 'Email check failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (values) => {
    setLoading(true);
    try {
      const result = await loginWithEmailPassword(email, values.password);
      if (result.success) {
        showSuccess('Login successful!');
        navigate('/');
      } else {
        showError(result.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPinCode = async (values) => {
    setLoading(true);
    try {
      const result = await sendPinCode(values.mobile);
      if (result.success) {
        setMobile(values.mobile);
        setShowPinField(true);
        message.success('PIN code sent successfully!');
      } else {
        message.error(result.message || 'Failed to send PIN');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMobileLogin = async (values) => {
    setLoading(true);
    try {
      const result = await loginWithMobilePincode(mobile, values.pincode);
      if (result.success) {
        message.success('Login successful!');
        navigate('/');
      } else {
        message.error(result.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInitialButtons = () => (
    <div className="space-y-4">
      <Button 
        type="primary" 
        block 
        size="large"
        onClick={() => setLoginMethod('email')}
        style={{ backgroundColor: 'var(--ksk-green)', borderColor: 'var(--ksk-green)' }}
        className="hover:opacity-90"
      >
        Login with Email
      </Button>
      <Button 
        type="primary" 
        block 
        size="large"
        onClick={() => setLoginMethod('mobile')}
        style={{ backgroundColor: 'var(--ksk-purple)', borderColor: 'var(--ksk-purple)' }}
        className="hover:opacity-90"
      >
        Login with Mobile
      </Button>
    </div>
  );

  const renderEmailLogin = () => (
    <div className="space-y-4">
      {!showPasswordField ? (
        <Form onFinish={handleEmailPreLogin} layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email"
              className="h-10"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ backgroundColor: 'var(--ksk-green)', borderColor: 'var(--ksk-green)' }}
            className="w-full h-10 hover:opacity-90"
          >
            Continue
          </Button>
        </Form>
      ) : (
        <Form onFinish={handleEmailLogin} layout="vertical">
          <div className="mb-4 text-sm text-gray-600">
            Email: {email}
          </div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password"
              className="h-10"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ backgroundColor: 'var(--ksk-green)', borderColor: 'var(--ksk-green)' }}
            className="w-full h-10 hover:opacity-90"
          >
            Log in
          </Button>
        </Form>
      )}
    </div>
  );

  const renderMobileLogin = () => (
    <div className="space-y-4">
      {!showPinField ? (
        <Form onFinish={handleSendPinCode} layout="vertical">
          <Form.Item
            name="mobile"
            rules={[{ required: true, message: 'Please input your mobile number!' }]}
          >
            <Input 
              prefix={<MobileOutlined />} 
              placeholder="Mobile Number"
              className="h-10"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ backgroundColor: 'var(--ksk-green)', borderColor: 'var(--ksk-green)' }}
            className="w-full h-10 hover:opacity-90"
          >
            Send PIN Code
          </Button>
        </Form>
      ) : (
        <Form onFinish={handleMobileLogin} layout="vertical">
          <div className="mb-4 text-sm text-gray-600">
            Mobile: {mobile}
          </div>
          <Form.Item
            name="pincode"
            rules={[{ required: true, message: 'Please input the PIN code!' }]}
          >
            <Input 
              prefix={<KeyOutlined />} 
              placeholder="Enter PIN Code"
              className="h-10"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ backgroundColor: 'var(--ksk-green)', borderColor: 'var(--ksk-green)' }}
            className="w-full h-10 hover:opacity-90"
          >
            Log in
          </Button>
        </Form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-[400px] shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--ksk-purple)' }}>Welcome Back</h2>
          <p className="mt-2" style={{ color: 'var(--ksk-grey)' }}>Please sign in to your account</p>
        </div>
        
        {!loginMethod && renderInitialButtons()}
        {loginMethod === 'email' && renderEmailLogin()}
        {loginMethod === 'mobile' && renderMobileLogin()}

        {loginMethod && (
          <Button 
            type="link" 
            className="mt-4"
            onClick={() => {
              setLoginMethod(null);
              setShowPasswordField(false);
              setShowPinField(false);
              setEmail('');
              setMobile('');
            }}
          >
            ← Back to login options
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Login;