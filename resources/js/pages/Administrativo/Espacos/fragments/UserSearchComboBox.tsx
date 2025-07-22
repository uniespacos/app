'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface UserSearchComboboxProps {
    usuarios: User[];
    value: number | null;
    onValueChange: (value: number | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function UserSearchCombobox({ usuarios, value, onValueChange, placeholder = 'Buscar usuário...', disabled = false }: UserSearchComboboxProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const selectedUser = usuarios.find((user) => user.id === value);

    // Filtrar usuários baseado na busca
    const filteredUsers = useMemo(() => {
        if (!searchValue.trim()) return usuarios;

        const search = searchValue.toLowerCase().trim();
        return usuarios.filter((user) => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));
    }, [usuarios, searchValue]);

    const handleSelect = (userId: number) => {
        onValueChange(userId === value ? null : userId);
        setOpen(false);
        setSearchValue('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onValueChange(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSearchValue('');
        }
    };
    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-transparent" disabled={disabled} type="button">
                    {selectedUser ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={''} />
                                <AvatarFallback className="text-xs">
                                    {selectedUser.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col items-start">
                                <span className="truncate text-sm font-medium">{selectedUser.name}</span>
                                <span className="text-muted-foreground truncate text-xs">{selectedUser.email}</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <div className="flex items-center gap-1">
                        {selectedUser && (
                            <div
                                className="hover:bg-destructive hover:text-destructive-foreground flex h-4 w-4 cursor-pointer items-center justify-center rounded p-0"
                                onClick={handleClear}
                            >
                                <X className="h-3 w-3" />
                            </div>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start" side="bottom" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="h-auto border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => {
                            // Prevenir que o popover feche com Escape
                            if (e.key === 'Escape') {
                                e.stopPropagation();
                                setSearchValue('');
                                if (!searchValue) {
                                    setOpen(false);
                                }
                            }
                        }}
                    />
                </div>
                <ScrollArea className="max-h-60">
                    <div className="p-1">
                        {filteredUsers.length === 0 ? (
                            <div className="text-muted-foreground py-6 text-center text-sm">
                                {searchValue ? 'Nenhum usuário encontrado.' : 'Digite para buscar usuários...'}
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm p-2"
                                    onClick={() => handleSelect(user.id)}
                                >
                                    <Check className={cn('mr-2 h-4 w-4', value === user.id ? 'opacity-100' : 'opacity-0')} />
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.profile_pic || '/placeholder.svg?height=32&width=32'} />
                                        <AvatarFallback className="text-xs">
                                            {user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-medium">{user.name}</span>
                                        <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
