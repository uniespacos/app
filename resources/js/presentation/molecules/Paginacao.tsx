import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginacaoProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Paginacao({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginacaoProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null; // Não renderiza a paginação se houver apenas uma página ou menos
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Máximo de números de página a serem exibidos
        let startPage: number, endPage: number;

        if (totalPages <= maxPagesToShow) {
            // Mostra todos os números de página se o total for menor ou igual ao máximo
            startPage = 1;
            endPage = totalPages;
        } else {
            // Lógica para exibir um subconjunto de números de página
            const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
            const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(i)}
                    className="h-9 w-9"
                >
                    {i}
                </Button>,
            );
        }

        return pageNumbers;
    };

    return (
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-muted-foreground text-sm">Total de {totalItems} item(s) encontrado(s).</div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" className="hidden h-9 w-9 p-0 lg:flex" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    <span className="sr-only">Primeira página</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-9 w-9 p-0" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <span className="sr-only">Página anterior</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {renderPageNumbers()}

                <Button
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span className="sr-only">Próxima página</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-9 w-9 p-0 lg:flex"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <span className="sr-only">Última página</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
