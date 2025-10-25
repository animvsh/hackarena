interface Client {
  name: string;
  company: string;
  amount: string;
  trend: number;
  color: string;
}

const clients: Client[] = [
  { name: "BrianWinAngda Inc", company: "", amount: "$853,991", trend: 25, color: "neon-blue" },
  { name: "Galemberg LLC", company: "", amount: "$245,000", trend: -10, color: "neon-purple" },
  { name: "Monadary Inc", company: "", amount: "$77,392", trend: 85, color: "neon-pink" },
];

export const TopClients = () => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-bold mb-6">Top Big Clients</h3>
      <div className="space-y-4">
        {clients.map((client, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${client.color}/20 flex items-center justify-center flex-shrink-0`}>
              <div className={`w-6 h-6 bg-${client.color} rounded-lg`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{client.amount}</p>
              <p className="text-xs text-muted-foreground truncate">{client.name}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
              client.trend > 0 
                ? "bg-success text-success-foreground" 
                : "bg-destructive text-destructive-foreground"
            }`}>
              {client.trend > 0 ? "+" : ""}{client.trend}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
