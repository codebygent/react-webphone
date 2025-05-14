import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHistoryStore from '../store/history.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faArrowRight, faArrowLeft, faClock, faSearch } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/images/logo.png';
import { format, isToday, isYesterday } from 'date-fns';
import * as UJP from '../store/uj-phone';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const { calls, getFilteredCalls, removeCall, clearHistory } = useHistoryStore();
  const navigate = useNavigate();

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

  const handleCall = (number, name) => {
    navigate('/phone');
    setTimeout(() => {
      UJP.DialByLine(name, number);
    }, 100);
  };

  const groupCallsByDay = (calls) => {
    const groups = {};

    calls.forEach(call => {
      const date = new Date(call.timestamp);
      let dayKey;

      if (isToday(date)) {
        dayKey = 'Today';
      } else if (isYesterday(date)) {
        dayKey = 'Yesterday';
      } else {
        dayKey = format(date, 'dd MMM yyyy');
      }

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(call);
    });

    return groups;
  };

  const groupedCalls = groupCallsByDay(filteredCalls);

  return (
    <div>
      <header className="p-3">
        <img src={logo} className='mb-2 w-[120px]' />
        <h1 className="text-[20px] font-extrabold text-[var(--ksk-pink)]">
          History
        </h1>
      </header>
      <div className="px-4 py-2 bg-[#f3f7fa] flex mb-2 border-b border-t">
        <FontAwesomeIcon
          icon={faSearch}
          className="text-gray-500 text-lg"
        />
        <input
          className="flex-1 bg-[#f3f7fa] placeholder:text-[15px] focus:outline-none px-2 text-[15px] font-semibold"
          placeholder="Search name, number....."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="hist-height overflow-y-auto">
              {Object.entries(groupedCalls).map(([day, dayCalls]) => (
                <div key={day} className="mb-4">
                  <div className="px-4 py-2 bg-[#f3f7fa] text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                  <div className="divide-y divide-[#e6d9e0]">
                    {dayCalls.map((call) => (
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
                          onClick={() => handleCall(call.number, call.name)}
                          className="text-gray-500 hover:text-green-700"
                        >
                          <FontAwesomeIcon icon={faPhone} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
