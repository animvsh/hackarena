export class BroadcastActivityMonitor {
  private lastEventTime: number = Date.now();
  private activityThreshold = 30000; // 30 seconds
  private longInactivityThreshold = 120000; // 2 minutes

  updateActivity() {
    this.lastEventTime = Date.now();
  }

  getTimeSinceLastEvent(): number {
    return Date.now() - this.lastEventTime;
  }

  isInactive(): boolean {
    return this.getTimeSinceLastEvent() > this.activityThreshold;
  }

  isLongInactive(): boolean {
    return this.getTimeSinceLastEvent() > this.longInactivityThreshold;
  }

  getActivityStatus(): 'active' | 'inactive' | 'long-inactive' {
    if (this.isLongInactive()) return 'long-inactive';
    if (this.isInactive()) return 'inactive';
    return 'active';
  }

  getFillerInterval(): number {
    const status = this.getActivityStatus();
    switch (status) {
      case 'active':
        return 0; // No filler needed
      case 'inactive':
        return 20000; // Filler every 20 seconds
      case 'long-inactive':
        return 15000; // More frequent filler every 15 seconds
    }
  }
}
