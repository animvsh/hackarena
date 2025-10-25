import { Crown, Smartphone, Users } from "lucide-react";

const drivers = [
  { icon: Crown, label: "Brand Awareness", value: "14,401,220 Million Views", color: "neon-purple" },
  { icon: Smartphone, label: "Software Promotion", value: "39,496 Installed", color: "neon-blue" },
  { icon: Users, label: "Users Growth", value: "556,311 Users Signed Up", color: "neon-pink" },
];

export const RevenueDrivers = () => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-bold mb-6">Revenue Drivers</h3>
      <div className="space-y-4">
        {drivers.map((driver, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${driver.color}/20 flex items-center justify-center flex-shrink-0`}>
              <driver.icon className={`w-5 h-5 text-${driver.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{driver.label}</p>
              <p className="text-xs text-muted-foreground truncate">{driver.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
