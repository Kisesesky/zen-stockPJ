export {};
declare const Chart: any;

interface ChartData {
    date: string;
    close: number;
}

let chartInstance: any = null;

async function createStockChart(symbol: string, period: string = '1y') {
    try {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const response = await fetch(`/api/v1/stock/chart/${symbol}?period=${period}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        const canvas = document.getElementById('stockChart') as HTMLCanvasElement;
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.map((d: { date: string }) => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    data: data.map((d: { close: number }) => d.close),
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                return `$${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        display: true,
                        grid: { display: false }
                    },
                    y: { 
                        display: true,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error creating chart for ${symbol}:`, error);
    }
}

function setupPeriodButtons() {
    const periods = ['1d', '1w', '1m', '3m', '6m', '1y', '5y', 'max'];
    periods.forEach(period => {
        const button = document.getElementById(`period-${period}`);
        if (button) {
            button.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                updateChartPeriod(period);
            });
        }
    });
}

async function updateChartPeriod(period: string) {
    const symbol = document.getElementById('stockSymbol')?.dataset.symbol;
    if (!symbol) return;
    await createStockChart(symbol, period);
}

document.addEventListener('DOMContentLoaded', () => {
    const symbol = document.getElementById('stockSymbol')?.dataset.symbol;
    if (symbol) {
        createStockChart(symbol);
        setupPeriodButtons();
    }
});