import { Skeleton } from '@/components/ui/skeleton';

export function ReservasLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="rounded-md border">
                <div className="flex h-10 items-center border-b px-4 py-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="ml-auto h-5 w-1/6" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b px-4 py-4 last:border-0">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center space-x-2 py-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    );
}
