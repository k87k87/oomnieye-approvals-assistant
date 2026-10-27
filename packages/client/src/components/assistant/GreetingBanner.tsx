import React, { useState } from "react";
import { Sparkles, AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { useAssistantStore } from "../../store/useAssistantStore";

export const GreetingBanner: React.FC = () => {
  const { greetingText, greetingDegraded, isGreetingLoading } = useAssistantStore();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !greetingText) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(greetingText);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="p-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border-b border-blue-100/80 text-xs">
      <div className="flex items-start space-x-2.5">
        <div className="w-5 h-5 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[11px] text-slate-800">Operational Brief</span>
              {greetingDegraded && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Cached Fallback</span>
                </span>
              )}
            </div>

            <button
              onClick={handleSpeak}
              title="Listen to greeting out loud"
              className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded"
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-slate-500 hover:text-blue-600" />
              )}
            </button>
          </div>

          <p className="text-slate-600 mt-1 leading-relaxed text-[11.5px]">
            {isGreetingLoading ? (
              <span className="text-slate-400 italic animate-pulse">
                Consulting pending queue telemetry...
              </span>
            ) : (
              greetingText
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
