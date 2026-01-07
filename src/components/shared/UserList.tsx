import { Button } from "@/components/ui/button";
import { Loader, UserListItem } from "@/components/shared";
import { useGetUsersByIds } from "@/lib/react-query/queries";
import { X } from "lucide-react";

type UserListProps = {
  userIds: string[];
  title: string;
  onClose: () => void;
};

const UserList = ({ userIds, title, onClose }: UserListProps) => {
  const { data: users, isLoading } = useGetUsersByIds(userIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-dark-2 w-full max-w-md rounded-xl flex flex-col max-h-[70vh] shadow-2xl border border-dark-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-dark-4">
          <div className="w-6" /> {/* Spacer */}
          <h3 className="base-medium md:body-bold text-center">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-dark-4 rounded-full transition"
          >
            <X className="text-white w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isLoading ? (
            <div className="flex-center w-full h-32">
              <Loader />
            </div>
          ) : users?.documents && users.documents.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {users.documents.map((user) => (
                <li key={user.$id} className="w-full border-b border-dark-4 last:border-none pb-1">
                  <UserListItem user={user} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-light-4 text-center py-10 small-medium">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
