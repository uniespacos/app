import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';
import type { ViewMode } from '@/presentation/molecules/ViewModeToggle';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
    header: string | ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    keyExtractor?: (item: T, index: number) => string | number;
    actions?: (item: T, index: number) => ReactNode;
    actionsHeader?: string;
    actionsAlign?: 'left' | 'center' | 'right';
    actionsWidth?: string;
    viewMode?: ViewMode;
    renderCard?: (item: T, index: number) => ReactNode;
    gridClassName?: string;
    pagination?: {
        links: { url?: string | null; label: string; active?: boolean }[];
        meta?: object;
    };
    emptyState?: {
        title?: string;
        description?: string;
        action?: ReactNode;
    };
    cardWrapper?: boolean;
    cardTitle?: string;
    cardDescription?: string;
    cardHeaderAction?: ReactNode;
    className?: string;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    actions,
    actionsHeader = 'Ações',
    actionsAlign = 'right',
    actionsWidth,
    viewMode = 'table',
    renderCard,
    gridClassName = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    pagination,
    emptyState,
    cardWrapper = true,
    cardTitle,
    cardDescription,
    cardHeaderAction,
    className,
}: DataTableProps<T>) {
    const totalColumns = columns.length + (actions ? 1 : 0);

    const getRowKey = (item: T, index: number): string | number => {
        if (keyExtractor) return keyExtractor(item, index);
        if (
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            (typeof (item as { id: unknown }).id === 'string' || typeof (item as { id: unknown }).id === 'number')
        ) {
            return (item as { id: string | number }).id;
        }
        return index;
    };

    const renderCellContent = (column: ColumnDef<T>, item: T, index: number): ReactNode => {
        if (column.cell) {
            return column.cell(item, index);
        }
        if (column.accessorKey) {
            const val = item[column.accessorKey];
            if (val === null || val === undefined) return 'N/A';
            return String(val);
        }
        return null;
    };

    const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            case 'left':
            default:
                return 'text-left';
        }
    };

    const emptyContent = (
        <div className="flex flex-col items-center justify-center space-y-2 py-10 text-center">
            <p className="text-foreground font-medium">{emptyState?.title ?? 'Nenhum registro encontrado'}</p>
            {emptyState?.description && <p className="text-muted-foreground text-sm">{emptyState.description}</p>}
            {emptyState?.action && <div className="pt-2">{emptyState.action}</div>}
        </div>
    );

    const tableContent = (
        <div className="w-full overflow-x-auto rounded-md border">
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                        {columns.map((col, idx) => (
                            <TableHead
                                key={idx}
                                style={col.width ? { width: col.width } : undefined}
                                className={cn(getAlignmentClass(col.align), 'whitespace-nowrap', col.className)}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                        {actions && (
                            <TableHead
                                style={actionsWidth ? { width: actionsWidth } : undefined}
                                className={cn(getAlignmentClass(actionsAlign), 'w-[120px] whitespace-nowrap')}
                            >
                                {actionsHeader}
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={totalColumns} className="py-10 text-center">
                                {emptyContent}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item, index) => (
                            <TableRow key={getRowKey(item, index)}>
                                {columns.map((col, colIdx) => (
                                    <TableCell key={colIdx} className={cn(getAlignmentClass(col.align), col.className)}>
                                        {renderCellContent(col, item, index)}
                                    </TableCell>
                                ))}
                                {actions && <TableCell className={cn(getAlignmentClass(actionsAlign))}>{actions(item, index)}</TableCell>}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const gridContent = (
        <div>
            {data.length === 0 ? (
                emptyContent
            ) : (
                <div className={cn(gridClassName)}>
                    {data.map((item, index) => (
                        <div key={getRowKey(item, index)}>{renderCard?.(item, index)}</div>
                    ))}
                </div>
            )}
        </div>
    );

    const mainContent = (
        <div className={cn('w-full space-y-4', className)}>
            {viewMode === 'grid' && renderCard ? gridContent : tableContent}
            {pagination?.links && pagination.links.length > 1 && <PaginacaoListas links={pagination.links} />}
        </div>
    );

    if (!cardWrapper) {
        return mainContent;
    }

    return (
        <Card className="w-full overflow-hidden">
            {(cardTitle ?? cardDescription ?? cardHeaderAction) && (
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
                        {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
                    </div>
                    {cardHeaderAction && <div className="shrink-0 self-start sm:self-auto">{cardHeaderAction}</div>}
                </CardHeader>
            )}
            <CardContent className="p-4 sm:p-6">{mainContent}</CardContent>
        </Card>
    );
}
