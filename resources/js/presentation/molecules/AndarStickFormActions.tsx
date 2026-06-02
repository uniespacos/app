'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AndarStickFormActionsProps {
    processing: boolean;
    isEditMode: boolean;
    onScrollToTop: () => void;
    andaresCount: number;
}

export default function AndarStickFormActions({ onScrollToTop, andaresCount }: AndarStickFormActionsProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Mostrar quando rolar mais de 300px
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed right-4 bottom-4 z-50">
            <Card className="border-2 shadow-lg">
                <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                        <div className="text-muted-foreground text-sm">
                            {andaresCount} andar{andaresCount !== 1 ? 'es' : ''}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={onScrollToTop} className="h-8 bg-transparent">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
