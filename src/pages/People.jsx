import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { useContactsStore } from '../store/contactsStore';
import teamPlaceholder from '../assets/images/team-placeholder.png';
import logo from '../assets/images/logo.png';
import * as UJP from '../store/uj-phone';

export default function People() {
  const { contacts, teammates, isLoading, error, getFilteredTeams, getFilteredContacts, fetchContacts, fetchTeammates } = useContactsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const navigate = useNavigate();
  const filteredContacts = getFilteredContacts(searchTerm);
  const filteredTeams = getFilteredTeams(searchTerm);

  const handleCall = (number, name) => {
    navigate('/phone');
    setTimeout(() => {
      UJP.DialByLine(name, number);
    }, 100);
  };
  useEffect(() => {
    if (contacts.length == 0) {
      fetchContacts();
    }
    if (teammates.length == 0) {
      fetchTeammates();
    }
  }, [fetchContacts]);


  return (
    <div>
      <header className="p-3">
        <img src={logo} className='mb-2 w-[120px]' />
        <h1 className="text-[20px] font-extrabold text-[var(--ksk-pink)]">
          People
        </h1>
      </header>
      <div className="px-4 py-2 bg-[#f3f7fa] flex mb-2 border-b border-t">
        <FontAwesomeIcon
          icon={faSearch}
          className="text-gray-500 text-lg"
        />
        <input
          className="flex-1 bg-[#f3f7fa] px-2 placeholder:text-[15px] focus:outline-none text-[15px] font-semibold"
          placeholder="Search name, number....."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
        />
      </div>
      <nav className="flex border-b border-[#b6d4c6]">
        <button
          className={`flex-1 py-3 text-center font-semibold bg-white border-r border-[#b6d4c6] 
            ${activeTab === 'contacts' ? 'text-[var(--ksk-pink)]' : 'text-gray-700'}`}
          type="button"
          onClick={() => setActiveTab('contacts')}
        >
          Contacts
        </button>
        <button
          className={`flex-1 py-3 text-center font-semibold bg-white
            ${activeTab === 'teams' ? 'text-[var(--ksk-pink)]' : 'text-gray-700'}`}
          type="button"
          onClick={() => setActiveTab('teams')}
        >
          Teammates
        </button>
      </nav>
      {

        (activeTab === 'contacts' ? filteredContacts : filteredTeams).length == 0 || error ? (
          <>
            {error && (<div>Error: {error}</div>)};
            <div className="flex justify-center items-center peop-height">
              <img
                src={teamPlaceholder}
                alt="Loading contacts..."
                className="w-50 h-50 opacity-50"
              />
            </div>
          </>
        ) : (
          <>
            <ul className="divide-y peop-height overflow-y-scroll divide-[#e6d9e0]">
              {(activeTab === 'contacts' ? filteredContacts : filteredTeams).map((contact, index) => (
                <li
                  onClick={() => handleCall(contact.number, contact.fullName)}
                  className="flex items-center gap-4 px-3 py-3 cursor-pointer"
                  key={`${contact.id}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 bg-[#b81f6a] flex items-center justify-center"
                  >
                    {contact.avatar ? (
                      <img className="w-7 h-7" src={contact.avatar} />
                    ) : (<FontAwesomeIcon
                      icon={faUser}
                      className="text-white text-xl"
                    />)}
                  </div>
                  <div>
                    <p className="font-semibold text-[17px] text-gray-900 leading-tight">
                      {contact.fullName}
                    </p>
                    <p className="text-gray-500 text-[15px] leading-tight">
                      {contact.status == 'REGISTERED' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
    </div>
  );
}
