import { Bell, Clock, Search } from 'lucide-react';

interface TopBarProps {
  currentTime: string;
  unreadAlerts: number;
  onAlertsClick: () => void;
}

export default function TopBar({ currentTime, unreadAlerts, onAlertsClick }: TopBarProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-iot-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iot-textTertiary" />
          <input
            type="text"
            placeholder="Search sensors, alerts, devices..."
            className="w-full pl-10 pr-4 py-2 bg-iot-surfaceHighlight border border-iot-border rounded-lg text-sm text-iot-textPrimary placeholder:text-iot-textTertiary focus:outline-none focus:ring-2 focus:ring-iot-primary/20 focus:border-iot-primary transition-all"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-iot-textSecondary">
          <Clock className="w-4 h-4 text-iot-textTertiary" />
          <span className="font-mono-data">{currentTime}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-iot-border" />

        {/* Notifications */}
        <button
          onClick={onAlertsClick}
          className="relative p-2 rounded-lg text-iot-textSecondary hover:bg-iot-surfaceHighlight hover:text-iot-textPrimary transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-iot-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-iot-border" />

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-iot-textPrimary">Plant Manager</p>
            <p className="text-xs text-iot-textTertiary">Industrial Zone A</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-iot-primary to-iot-accent flex items-center justify-center text-white text-sm font-bold">
            PM
          </div>
        </div>
      </div>
    </header>
  );
}
