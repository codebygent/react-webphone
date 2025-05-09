import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePhoneStore from '../store/phone.store';
import useHistoryStore from '../store/history.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowLeft, faClock, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const { calls, getFilteredCalls, removeCall, clearHistory } = useHistoryStore();
  const navigate = useNavigate();
  const { setNumber } = usePhoneStore();

  const filteredCalls = getFilteredCalls(searchTerm);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = (number) => {
    setNumber(number);
    navigate('/phone');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search calls..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCalls.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            No calls in history
          </div>
        ) : (
          <div className="divide-y">
            {filteredCalls.map((call) => (
              <div key={call.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={call.direction === 'inbound' ? faArrowLeft : faArrowRight}
                    className={call.direction === 'inbound' ? 'text-green-500' : 'text-blue-500'}
                  />
                  <div>
                    <div className="font-medium">{call.name}</div>
                    <div className="text-sm text-gray-500">{call.number}</div>
                    <div className="text-xs text-gray-400 flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-300" />
                      <span>{formatDate(call.timestamp)}</span>
                      <span>({formatDuration(call.duration)})</span>
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
  );
}
