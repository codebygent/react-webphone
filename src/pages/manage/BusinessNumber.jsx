
import { useAuthStore } from '../../store/authStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function BusinessNumber() {


  const { setoutgoingbusinessnumber, businessNumbers } = useAuthStore((state) => state);
  if (!businessNumbers) return null;
  return (

    <div>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">

          <div className="px-4 py-2 bg-[#f3f7fa] text-sm font-semibold text-gray-600">
            Business Numbers
          </div>
          {businessNumbers.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No business numbers found
            </div>
          ) : (
            <div className="hist-height overflow-y-auto">
              {businessNumbers.map((bn) => (
                <div key={bn.guid} className="p-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{bn.formattedAssociatedNumber}</div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <span>{bn.country}</span>
                        <span>{bn.city}</span>
                        <span>{bn.tag}</span>
                      </div>
                    </div>
                  </div>
                  {bn.isPrimary ? (
                    <div className="bg-[var(--ksk-green)] text-white px-3 py-1">
                      <span>Primary</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setoutgoingbusinessnumber(bn.guid)}
                      className="bg-[var(--ksk-purple)] text-white px-3 py-1 hover:bg-[var(--ksk-pink)]"
                      title="Set as Primary Business Number"
                    >
                      Set Primary
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
