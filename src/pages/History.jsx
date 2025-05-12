import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePhoneStore from '../store/phone.store';
import useHistoryStore from '../store/history.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowLeft, faClock, faTrash } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/images/logo.png';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const { calls, getFilteredCalls, removeCall, clearHistory } = useHistoryStore();
  const navigate = useNavigate();
  const { setNumber } = usePhoneStore();

  const filteredCalls = getFilteredCalls(searchTerm);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = (number) => {
    setNumber(number);
    navigate('/phone');
  };

  return (

    <div>

      <header className="p-3">
        <img src={logo} className='mb-2 w-[120px]' />
        <h1 className="text-[20px] font-extrabold text-[var(--ksk-pink)]">
          History
        </h1>
      </header>
      <div className="px-4 py-2 bg-[#f3f7fa] flex mb-2 border-b border-t">
        <i className="fas fa-search text-gray-500 text-lg"></i>
        <input
          className="flex-1 bg-[#f3f7fa] placeholder:text-[15px] focus:outline-none text-[15px] font-semibold"
          placeholder="Search name, number....."
          type="text"
        />
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {filteredCalls.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No calls in history
            </div>
          ) : (
            <div className="divide-y max-h-[380px] divide-[#e6d9e0]">
              {filteredCalls.map((call) => (
                <div key={call.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={call.direction === 'inbound' ? faArrowLeft : faArrowRight}
                      className={call.direction === 'inbound' ? 'text-green-500' : 'text-blue-500'}
                    />
                    <div>
                      <div className="font-medium">{call.name || call.number}</div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <FontAwesomeIcon icon={faClock} className="text-gray-300" />
                        <b>{formatDuration(call.duration) || call.status}</b>
                        <span>{formatDate(call.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCall(call.number)}
                    className="text-gray-500 hover:text-green-700"
                  >
                    <FontAwesomeIcon icon={faPhone} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
