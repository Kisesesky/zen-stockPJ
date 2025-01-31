import { 
    Chart, 
    LineController, 
    LineElement, 
    PointElement, 
    LinearScale, 
    CategoryScale,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Title
);

interface ChartData {
    date: string;
    close: number;
}

interface ChartResponse {
    symbol: string;
    data: ChartData[];
}

let chart: Chart | null = null;
let currentSymbol: string;

async function fetchChartData(symbol: string, period = '1y'): Promise<void> {
    try {
        const response = await fetch(`/api/v1/chart/data/${symbol}?period=${period}`);
        const data = await response.json();

        document.querySelector('.symbol-title')!.textContent = 
            `${data.symbol} 차트 (${period})`;

        const chartData = {
            labels: data.data.map((item: any) => new Date(item.date).toLocaleDateString('ko-KR')),
            datasets: [{
                label: '종가',
                data: data.data.map((item: any) => item.close),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        if (chart) {
            chart.destroy();
        }

        const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
        chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${data.symbol} 주가 차트 (${period})`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        updateActiveButton(period);
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

function changePeriod(period: string): void {
    const symbol = window.location.pathname.split('/').pop()!;
    fetchChartData(symbol, period);
}

function updateActiveButton(period: string): void {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`.period-btn[data-period="${period}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    currentSymbol = window.location.pathname.split('/').pop()!;
    if (currentSymbol) {
        fetchChartData(currentSymbol, '1y');
    }
});

export { fetchChartData, changePeriod, updateActiveButton }; 