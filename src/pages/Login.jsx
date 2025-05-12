import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../components/helpers/notifications';
import logo from '../assets/images/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginWithEmailPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await loginWithEmailPassword(formData.email, formData.password);
      if (result.success) {
        showSuccess('Login successful!');
        navigate('/phone');
      } else {
        showError(result.message || 'Login failed');
      }
    } catch (error) {
      showError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-3 py-15'>

      <div className="text-center mb-12">
        <div className="flex justify-center items-center space-x-2 mb-2">
          <img
            alt="Kasookoo logo"
            className="w-40 h-8"
            src={logo}
          />
        </div>
        <h1 className="font-montserrat text-[24px] font-extrabold text-[#3a1f7a] leading-none">
          Let's Sign In..!
        </h1>
        <p className="font-semibold text-[16px] text-[#4a4a4a] mt-1">
          Login to Your Account
        </p>
      </div>

      <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            className="flex items-center bg-white rounded-xl px-5 py-4 text-[#4a4a4a] text-lg font-semibold shadow-sm border focus-within:border-[#8caea1]"
            htmlFor="email"
          >
            <i className="far fa-envelope mr-3 text-lg"></i>
            <input
              className="w-full outline-none placeholder:text-[#4a4a4a] placeholder:font-semibold bg-transparent"
              id="email"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
          {errors.email && <p className="text-red-500 text-sm pl-5">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 text-[#4a4a4a] text-lg font-semibold shadow-sm border focus-within:border-[#8caea1]"
            htmlFor="password"
          >
            <div className="flex items-center space-x-3 flex-1">
              <i className="fas fa-lock text-lg"></i>
              <input
                className="w-full outline-none placeholder:text-[#4a4a4a] placeholder:font-semibold bg-transparent"
                id="password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
            </button>
          </label>
          {errors.password && <p className="text-red-500 text-sm pl-5">{errors.password}</p>}
        </div>

        <button
          className={`w-full max-w-[280px] mx-auto block bg-[#8caea1] text-white font-semibold text-lg rounded-full py-4 shadow-md hover:bg-[#7ba592] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
