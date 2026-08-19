import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const getInitials = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const names = fullName.trim().split(' ').filter(Boolean);

    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
}

const UserColumn = ({ user , hideAvatar = false }: { user?: any, hideAvatar?:boolean}) => {
    if (!user || (!user.name && !user.email)) {
        return <span className="text-gray-400">-</span>;
    }

    return (
        <div className="flex items-center gap-3">
            {!hideAvatar && <Avatar className="h-10 w-10">
                <AvatarImage
                    src={user?.avatar}
                    alt={user?.name || ''}
                />
                <AvatarFallback className="text-lg">
                    {getInitials(user?.name)}
                </AvatarFallback>
            </Avatar>}
            <div>
                <div className="font-medium">{user?.name || '-'}</div>
                {user?.email && <div className="text-sm text-muted-foreground">{user?.email}</div>}
            </div>
        </div>
    )
}

export default UserColumn
