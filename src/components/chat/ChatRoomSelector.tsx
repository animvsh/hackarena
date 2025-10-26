import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Plus, 
  Users, 
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatRoomSelector: React.FC = () => {
  const { rooms, currentRoom, joinRoom, createRoom } = useChat();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      await createRoom(newRoomName.trim(), newRoomDescription.trim());
      setNewRoomName('');
      setNewRoomDescription('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Chat Rooms
        </h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  required
                />
              </div>
              <div>
                <Input
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Room description (optional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {rooms.map((room) => (
          <Button
            key={room.id}
            variant={currentRoom?.id === room.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-2",
              currentRoom?.id === room.id && "bg-blue-50 dark:bg-blue-900/20"
            )}
            onClick={() => joinRoom(room.id)}
          >
            <div className="flex items-center space-x-2 w-full">
              <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm truncate">
                    {room.name}
                  </span>
                  {room.is_public ? (
                    <Globe className="h-3 w-3 text-green-500" />
                  ) : (
                    <Lock className="h-3 w-3 text-gray-500" />
                  )}
                </div>
                {room.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {room.description}
                  </p>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};



