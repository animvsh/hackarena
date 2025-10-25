export const BalanceCard = () => {
  return (
    <div className="bg-primary rounded-3xl p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-primary-foreground/10 rounded-2xl transform rotate-12"></div>
      
      <div className="relative z-10">
        <p className="text-primary-foreground/80 text-sm font-medium mb-2">Balance</p>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          $22,591,200
        </h2>
        <p className="text-primary-foreground/70 text-sm">
          Shayna Lowi • 06/22
        </p>
      </div>
    </div>
  );
};
