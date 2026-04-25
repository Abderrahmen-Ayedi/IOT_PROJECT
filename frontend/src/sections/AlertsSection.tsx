import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Bell, CheckCircle2, Info, AlertOctagon, Clock } from 'lucide-react';
import type { Alert } from '../hooks/useIoTData';

interface AlertsSectionProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
}

function AlertIcon({ type }: { type: Alert['type'] }) {
  switch (type) {
    case 'critical':
      return <AlertOctagon className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <Bell className="w-5 h-5 text-iot-textTertiary" />;
  }
}

function AlertBadge({ type }: { type: Alert['type'] }) {
  const styles = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${styles[type]}`}>
      {type}
    </span>
  );
}

export default function AlertsSection({ alerts, onMarkAsRead }: AlertsSectionProps) {
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-iot-textPrimary">Alert Panel</h2>
            <p className="text-sm text-iot-textSecondary mt-0.5">System notifications and warnings</p>
          </div>
          {unreadAlerts.length > 0 && (
            <span className="px-2 py-0.5 bg-iot-danger text-white text-xs font-bold rounded-full">
              {unreadAlerts.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alert Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="bg-white rounded-xl border border-iot-border p-5 shadow-card">
            <h3 className="text-sm font-semibold text-iot-textPrimary mb-4">Alert Summary</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Critical</p>
                    <p className="text-xs text-red-500">Immediate action required</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono-data text-red-600">
                  {alerts.filter((a) => a.type === 'critical').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Warning</p>
                    <p className="text-xs text-amber-500">Monitor closely</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono-data text-amber-600">
                  {alerts.filter((a) => a.type === 'warning').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Info</p>
                    <p className="text-xs text-blue-500">System updates</p>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono-data text-blue-600">
                  {alerts.filter((a) => a.type === 'info').length}
                </span>
              </div>
            </div>

            {/* Threshold Reference */}
            <div className="mt-4 pt-4 border-t border-iot-border">
              <h4 className="text-xs font-semibold text-iot-textTertiary uppercase tracking-wide mb-3">Thresholds</h4>
              <div className="space-y-2">
                {[
                  { label: 'CO2', warning: 600, critical: 800, unit: 'ppm' },
                  { label: 'Toxic Gas', warning: 250, critical: 350, unit: 'ppm' },
                  { label: 'Temperature', warning: 35, critical: 40, unit: '°C' },
                  { label: 'Humidity', warning: 75, critical: 85, unit: '%' },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between text-xs">
                    <span className="text-iot-textSecondary">{t.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 font-mono-data">{t.warning}{t.unit}</span>
                      <span className="text-iot-textTertiary">|</span>
                      <span className="text-red-600 font-mono-data">{t.critical}{t.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl border border-iot-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-iot-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-iot-textPrimary">Recent Alerts</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-iot-surfaceHighlight rounded-lg text-xs font-medium text-iot-textSecondary hover:text-iot-textPrimary transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
              <AnimatePresence initial={false}>
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-iot-textTertiary">
                    <CheckCircle2 className="w-10 h-10 mb-3 text-iot-primary" />
                    <p className="text-sm font-medium">All Clear</p>
                    <p className="text-xs mt-1">No alerts at this time</p>
                  </div>
                ) : (
                  alerts.slice(0, 15).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-start gap-3 p-4 border-b border-iot-border/50 hover:bg-iot-surfaceHighlight/50 transition-colors ${
                        !alert.read ? 'bg-iot-primary/[0.02]' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertIcon type={alert.type} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertBadge type={alert.type} />
                          <span className="text-xs text-iot-textTertiary font-mono-data">{alert.sensor}</span>
                        </div>
                        <p className={`text-sm ${!alert.read ? 'font-semibold text-iot-textPrimary' : 'text-iot-textSecondary'}`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-xs text-iot-textTertiary">
                            <Clock className="w-3 h-3" />
                            <span className="font-mono-data">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <span className="text-xs text-iot-textTertiary">
                            Value: <span className="font-mono-data font-medium text-iot-textSecondary">{alert.value}</span> /
                            Limit: <span className="font-mono-data font-medium text-iot-textSecondary">{alert.threshold}</span>
                          </span>
                        </div>
                      </div>

                      {!alert.read && (
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="flex-shrink-0 p-1 rounded-md text-iot-textTertiary hover:text-iot-textPrimary hover:bg-iot-surfaceHighlight transition-colors"
                          title="Mark as read"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
