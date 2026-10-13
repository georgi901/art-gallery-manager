(function () {
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? String(dateString) : date.toLocaleDateString('ro-RO');
    }

    function formatCell(value, column) {
        if (value === null || value === undefined || value === '') return '-';
        if (column.startsWith('DATA_')) return formatDate(value);
        if (typeof value === 'number') {
            if (column.includes('SUMA') || column.includes('TAXA')) {
                return `${value.toLocaleString('ro-RO')} RON`;
            }
            if (column.includes('_CM')) return `${value} cm`;
            if (column.includes('_MP')) return `${value} m²`;
        }
        return String(value);
    }

    function queryString(values) {
        const params = new URLSearchParams();
        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') params.set(key, value);
        });
        const result = params.toString();
        return result ? `?${result}` : '';
    }

    window.galleryUtils = { formatCell, formatDate, queryString };
})();
