import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * Um item com um unico subitem nao justifica um grupo recolhivel: nesse caso
 * o subitem sobe para o menu principal, mantendo o icone do grupo.
 */
function normalizar(item: NavItem): NavItem {
    if (!item.items || item.items.length === 0) {
        return { title: item.title, href: item.href, icon: item.icon };
    }

    if (item.items.length === 1) {
        return { ...item.items[0], icon: item.items[0].icon ?? item.icon };
    }

    return item;
}

export function NavMain({ items = [], label }: { items: NavItem[]; label: string }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map(normalizar).map((item) =>
                    item.items ? (
                        <ItemComSubmenu key={item.title} item={item} urlAtual={page.url} />
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function ItemComSubmenu({ item, urlAtual }: { item: NavItem; urlAtual: string }) {
    const subitens = item.items ?? [];
    const algumAtivo = subitens.some((subitem) => subitem.href === urlAtual);

    return (
        <Collapsible asChild defaultOpen={algumAtivo} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={algumAtivo} tooltip={{ children: item.title }}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {subitens.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.title}>
                                <SidebarMenuSubButton asChild isActive={subitem.href === urlAtual}>
                                    <Link href={subitem.href} prefetch>
                                        {subitem.icon && <subitem.icon />}
                                        <span>{subitem.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
