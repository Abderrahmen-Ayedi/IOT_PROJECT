import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { MapPin, Factory, Droplets, Wind, Volume2 } from 'lucide-react';

const donutData = [
  { name: 'Manufacturing', value: 45, color: '#10B981' },
  { name: 'Water Quality', value: 25, color: '#3B82F6' },
  { name: 'Air Quality', value: 20, color: '#9CA3AF' },
  { name: 'Noise Levels', value: 10, color: '#06B6D4' },
];

const areaData = [
  { time: '00:00', airPurity: 92, humidity: 55, methane: 12, co2: 420, o2: 20.9 },
  { time: '04:00', airPurity: 88, humidity: 58, methane: 15, co2: 480, o2: 20.8 },
  { time: '08:00', airPurity: 75, humidity: 62, methane: 28, co2: 650, o2: 20.5 },
  { time: '12:00', airPurity: 65, humidity: 68, methane: 42, co2: 820, o2: 20.2 },
  { time: '16:00', airPurity: 70, humidity: 65, methane: 35, co2: 720, o2: 20.4 },
  { time: '20:00', airPurity: 85, humidity: 58, methane: 18, co2: 510, o2: 20.7 },
];

const sensorLocations = [
  { id: 1, x: 25, y: 35, name: 'Zone A', status: 'online' as const },
  { id: 2, x: 55, y: 25, name: 'Zone B', status: 'online' as const },
  { id: 3, x: 70, y: 55, name: 'Zone C', status: 'warning' as const },
  { id: 4, x: 40, y: 70, name: 'Zone D', status: 'online' as const },
  { id: 5, x: 80, y: 40, name: 'Zone E', status: 'offline' as const },
];

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg border border-iot-border shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-iot-textPrimary">{payload[0].name}</p>
      <p className="text-xs font-mono-data text-iot-textSecondary">{payload[0].value}%</p>
    </div>
  );
}

export default function MapSection() {
  const mapBg = '/assets/map-background.jpg';

  return (
    <section className="relative">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-iot-textPrimary">Sensor Locations</h2>
          <p className="text-sm text-iot-textSecondary mt-0.5">Geographic monitoring distribution</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="relative rounded-xl overflow-hidden border border-iot-border shadow-card"
        style={{ height: '500px' }}
      >
        {/* Map Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mapBg})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-iot-bg/30 via-transparent to-iot-bg/50" />

        {/* Sensor Location Pins */}
        {sensorLocations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + location.id * 0.1, type: 'spring', stiffness: 200 }}
            className="absolute"
            style={{ left: `${location.x}%`, top: `${location.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  location.status === 'online'
                    ? 'bg-emerald-500'
                    : location.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
              {/* Pulse Ring */}
              {location.status === 'online' && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-30" />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded-md shadow-lg border border-iot-border whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <p className="text-[10px] font-semibold text-iot-textPrimary">{location.name}</p>
                <p className="text-[9px] text-iot-textTertiary capitalize">{location.status}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Glassmorphic Overlay Cards */}
        <div className="absolute inset-0 p-4 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Left Card - Industry Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="glass-card rounded-xl p-4 shadow-lg self-start max-w-[280px] pointer-events-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-4 h-4 text-iot-textSecondary" />
                <h4 className="text-sm font-semibold text-iot-textPrimary">Industries</h4>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={35}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-1.5">
                  {donutData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-iot-textSecondary">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono-data font-semibold text-iot-textPrimary">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Card - Sensor Trends */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="glass-card rounded-xl p-4 shadow-lg self-start justify-self-end max-w-[320px] pointer-events-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-4 h-4 text-iot-textSecondary" />
                <h4 className="text-sm font-semibold text-iot-textPrimary">IoT Air Sensors</h4>
              </div>

              <div className="h-20 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <Area
                      type="monotone"
                      dataKey="airPurity"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'Air Purity', icon: Wind, color: 'text-emerald-500', value: '92%' },
                  { label: 'Humidity', icon: Droplets, color: 'text-blue-500', value: '58%' },
                  { label: 'CO2 Level', icon: Factory, color: 'text-amber-500', value: '520ppm' },
                  { label: 'Noise', icon: Volume2, color: 'text-cyan-500', value: '48dB' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className="text-[10px] text-iot-textSecondary">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono-data font-semibold text-iot-textPrimary">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
