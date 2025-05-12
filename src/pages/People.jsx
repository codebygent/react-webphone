import { useEffect } from 'react';
import { useContactsStore } from '../store/contactsStore';
import teamPlaceholder from '../assets/images/team-placeholder.png';
import logo from '../assets/images/logo.png';

export default function People() {
  const { contacts, isLoading, error, fetchContacts } = useContactsStore();

  useEffect(() => {
    if (contacts.length == 0) {
      fetchContacts();
    }
  }, [fetchContacts]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <header className="p-3">
        <img src={logo} className='mb-2 w-[120px]' />
        <h1 className="text-[20px] font-extrabold text-[var(--ksk-pink)]">
          People
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
      <nav className="flex border-b border-[#b6d4c6]">
        <button className="flex-1 py-3 text-center text-gray-700 font-semibold bg-white border-r border-[#b6d4c6]" type="button">
          Contacts
        </button>
        <button className="flex-1 py-3 text-center text-[var(--ksk-pink)] bg-white font-semibold" type="button">
          Teammates
        </button>
      </nav>
      {isLoading ? (
        <div className="flex justify-center items-center h-[380px]">
          <img
            src={teamPlaceholder}
            alt="Loading contacts..."
            className="w-50 h-50 opacity-50"
          />
        </div>) : (<>
          <ul className="divide-y max-h-[380px] overflow-y-scroll divide-[#e6d9e0]">
            {contacts.map((contact, index) => (
              <li
                className="flex items-center gap-4 px-4 py-4"
                key={`${contact.contactNumber}-${contact.contactType}-${index}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 bg-[#b81f6a] flex items-center justify-center"
                >
                  <i className="fas fa-user text-white text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-[17px] text-gray-900 leading-tight">
                    {contact.contactName || contact.contactNumber}
                  </p>
                  <p className="text-gray-500 text-[15px] leading-tight">
                    {contact.status || 'Offline'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>)}
    </div>
  );
}
