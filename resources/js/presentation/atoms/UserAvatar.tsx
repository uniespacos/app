import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

interface UserAvatarProps {
    user: User;
    className?: string;
    fallbackClassName?: string;
}

export function UserAvatar({ user, className = 'h-8 w-8', fallbackClassName }: UserAvatarProps) {
    const getInitials = useInitials();
    const profilePic = user.profile_pic || ('avatar' in user ? String(user.avatar) : undefined);

    return (
        <Avatar className={`overflow-hidden rounded-full ${className}`}>
            <AvatarImage src={profilePic || '/placeholder.svg'} alt={user.name} />
            <AvatarFallback className={`rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white ${fallbackClassName}`}>
                {getInitials(user.name)}
            </AvatarFallback>
        </Avatar>
    );
}
