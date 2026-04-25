import { Wind, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-iot-border mt-8">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-iot-primary to-emerald-600 flex items-center justify-center">
                <Wind className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-iot-textPrimary">Pollution Prediction</span>
            </div>
            <p className="text-xs text-iot-textSecondary leading-relaxed max-w-xs">
              IoT-based air quality monitoring and prediction system for industrial environments. 
              Powered by machine learning and real-time sensor networks.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-start md:justify-center gap-8">
            <div>
              <h4 className="text-xs font-semibold text-iot-textPrimary uppercase tracking-wide mb-3">Platform</h4>
              <ul className="space-y-2">
                {['Dashboard', 'Analytics', 'Predictions', 'Devices'].map((link) => (
                  <li key={link}>
                    <button className="text-xs text-iot-textSecondary hover:text-iot-primary transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-iot-textPrimary uppercase tracking-wide mb-3">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'API Reference', 'Support', 'Status'].map((link) => (
                  <li key={link}>
                    <button className="text-xs text-iot-textSecondary hover:text-iot-primary transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="text-xs font-semibold text-iot-textPrimary uppercase tracking-wide mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg bg-iot-surfaceHighlight flex items-center justify-center text-iot-textTertiary hover:text-iot-primary hover:bg-iot-primary/10 transition-colors">
                <Github className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-iot-surfaceHighlight flex items-center justify-center text-iot-textTertiary hover:text-iot-primary hover:bg-iot-primary/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-iot-surfaceHighlight flex items-center justify-center text-iot-textTertiary hover:text-iot-primary hover:bg-iot-primary/10 transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-iot-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-iot-textTertiary">
            © 2024 Pollution Prediction. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-xs text-iot-textTertiary hover:text-iot-textSecondary transition-colors">
              Privacy Policy
            </button>
            <button className="text-xs text-iot-textTertiary hover:text-iot-textSecondary transition-colors">
              Terms of Service
            </button>
            <button className="text-xs text-iot-textTertiary hover:text-iot-textSecondary transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
