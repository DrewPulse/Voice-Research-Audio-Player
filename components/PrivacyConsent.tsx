import { useState } from 'react';
import { Shield, Camera, Database, Clock } from 'lucide-react';

interface PrivacyConsentProps {
  onConsent: (granted: boolean) => void;
  onClose: () => void;
}

export function PrivacyConsent({ onConsent, onClose }: PrivacyConsentProps) {
  const [videoConsent, setVideoConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);

  const canProceed = videoConsent && dataConsent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Research Consent</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 text-sm">
              This voice research study will collect data to improve audio experiences. 
              Please review and consent to the following data collection:
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Video Recording</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={videoConsent}
                          onChange={(e) => setVideoConsent(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">I consent</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Optional camera recording during the session for research analysis. 
                      Videos are stored securely and used only for research purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Survey & Interaction Data</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dataConsent}
                          onChange={(e) => setDataConsent(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">I consent</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Collection of your audio preferences, switching behavior, and survey responses 
                      for research analysis. This data is anonymized and secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">Data Retention:</p>
                  <p>Research data is retained for analysis purposes and may be used in aggregate research publications. Personal identifying information is not collected.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onConsent(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onConsent(true)}
              disabled={!canProceed}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                canProceed
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Begin Study
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}