import { message } from 'antd';

export const showMessage = ({
  type = 'info',
  content = '',
  duration = 3,
  ...rest
}) => {
  message.open({
    type,
    content,
    duration,
    ...rest,
  });
};

// Convenience methods
export const showSuccess = (content) => showMessage({ type: 'success', content });
export const showError = (content) => showMessage({ type: 'error', content });
export const showWarning = (content) => showMessage({ type: 'warning', content });
export const showInfo = (content) => showMessage({ type: 'info', content });
