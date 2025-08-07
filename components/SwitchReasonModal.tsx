import { useState } from 'react';

interface SwitchReasonModalProps {
  onSelectReason: (reason: string, customReason?: string) => void;
  onClose: () => void;
}

export function SwitchReasonModal({ onSelectReason }: SwitchReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const reasons = [
    'The voice was tiring',
    'The voice sounded robotic',
    'I got bored',
    "I didn't like the narrator's style",
    'Just wanted variety'
  ];

  const handleSubmit = () => {
    if (selectedReason) {
      onSelectReason(selectedReason, customReason.trim() || undefined);
    }
  };

  const isFormValid = selectedReason !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
      <div 
        className="bg-white w-full max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl sm:max-w-md sm:max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Why did you switch?
          </h2>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Help us understand your listening preferences by selecting why you switched clips.
            </p>

            {/* Reason Options */}
            <div className="space-y-3">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="switchReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 text-sm font-medium flex-1">
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom Reason Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="switchReason"
                  value="Other"
                  checked={selectedReason === 'Other'}
                  onChange={() => setSelectedReason('Other')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900 text-sm font-medium">Other</span>
              </label>
              
              {selectedReason === 'Other' && (
                <textarea
                  placeholder="Please specify your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              isFormValid 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}