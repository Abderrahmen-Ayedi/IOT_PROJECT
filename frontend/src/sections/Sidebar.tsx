import { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Bell,
  Brain,
  Cpu,
  Map,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wind,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'predictions', label: 'Predictions', icon: Brain },
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-iot-border z-50 transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-iot-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-iot-primary to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Wind className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-iot-textPrimary whitespace-nowrap">
              Pollution Prediction
            </h1>
            <p className="text-[10px] text-iot-textTertiary whitespace-nowrap">IoT Monitoring</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-iot-primary/10 text-iot-primary'
                  : 'text-iot-textSecondary hover:bg-iot-surfaceHighlight hover:text-iot-textPrimary'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-iot-primary' : 'text-iot-textTertiary group-hover:text-iot-textSecondary'
                }`}
              />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-iot-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-iot-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-iot-textTertiary hover:bg-iot-surfaceHighlight hover:text-iot-textSecondary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
