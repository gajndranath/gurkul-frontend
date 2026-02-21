import React, { useState, useEffect } from "react";

import { useSessionStore } from "../stores/sessionStore";

/**
 * FcmDebugger - Senior Diagnostic Tool
 * Renders a hidden/toggleable debug panel for push notifications.
 */
export const FcmDebugger: React.FC = () => {
  const { fcmToken, token, role } = useSessionStore();
  const [show, setShow] = useState(false);
  const [swStatus, setSwStatus] = useState<string>("checking...");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwStatus(reg ? `Active (Scope: ${reg.scope})` : "Not Registered");
      });
    } else {
      setSwStatus("Not Supported");
    }
  }, []);

  if (import.meta.env.MODE !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={() => setShow(!show)}
        className="bg-slate-800 text-white p-2 rounded-full shadow-lg hover:bg-slate-700 transition-colors"
        title="Debug FCM"
      >
        <div className={`w-3 h-3 rounded-full ${fcmToken ? "bg-green-500" : "bg-red-500"}`} />
      </button>

      {show && (
        <div className="absolute bottom-12 right-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 text-xs font-mono overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">FCM DIAGNOSTICS</h3>
            <span className="text-[10px] text-slate-400">DEV MODE</span>
          </div>

          <div className="space-y-3">
            <Item label="Auth Token" value={token ? "✔️ SET" : "❌ NULL"} />
            <Item label="Role" value={role || "NULL"} />
            <Item label="Permission" value={Notification.permission} />
            <Item label="SW Status" value={swStatus} />
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 mb-1 uppercase text-[9px]">FCM Token</p>
              <div className="bg-slate-50 p-2 rounded break-all select-all cursor-pointer hover:bg-slate-100 transition-colors">
                {fcmToken || "NO TOKEN GENERATED"}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(fcmToken || "");
                  alert("Token copied!");
                }}
                className="flex-1 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-bold"
              >
                COPY TOKEN
              </button>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("trigger-fcm-sync"));
                  alert("Manual sync triggered! Check console.");
                }}
                className="flex-1 py-1 bg-slate-100 text-slate-800 rounded hover:bg-slate-200 font-bold"
              >
                FORCE SYNC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-2 border-b border-slate-50 pb-1">
    <span className="text-slate-500">{label}:</span>
    <span className={`font-bold ${value.includes("❌") ? "text-red-500" : "text-slate-700"}`}>{value}</span>
  </div>
);
