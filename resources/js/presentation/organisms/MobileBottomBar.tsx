import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Building2, CalendarCheck, Home, Menu } from 'lucide-react';
import * as React from 'react';

export function MobileBottomBar() {
    const { url } = usePage();
    const { toggleSidebar } = useSidebar();

    const items = [
        { label: 'Início', href: '/dashboard', icon: Home, active: url === '/dashboard' || url === '/' || url.startsWith('/dashboard') },
        { label: 'Espaços', href: '/espacos', icon: Building2, active: url.startsWith('/espacos') },
        { label: 'Reservas', href: '/reservas', icon: CalendarCheck, active: url.startsWith('/reservas') },
    ];

    return (
        <nav
            aria-label="Navegação inferior mobile"
            className="border-border/70 bg-background/95 fixed right-0 bottom-0 left-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
            <div className="flex h-15 items-center justify-around px-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'focus-visible:ring-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none',
                                item.active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground active:text-primary',
                            )}
                        >
                            <Icon className={cn('h-5 w-5', item.active && 'stroke-[2.5px]')} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label="Abrir menu lateral"
                    className="text-muted-foreground hover:text-foreground active:text-primary focus-visible:ring-ring flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                    <Menu className="h-5 w-5" />
                    <span>Menu</span>
                </button>
            </div>
        </nav>
    );
}

export default MobileBottomBar;
