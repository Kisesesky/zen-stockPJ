//market-indices.ts

// Chart.js를 브라우저에서 직접 로드
declare const Chart: any;

interface ChartData {
    date: string;
    close: number;
}

async function createMarketChart(symbol: string): Promise<void> {
    try {
        // 차트 데이터 가져오기
        const response = await fetch(`/api/v1/market/chart/${symbol}`);
        const data: ChartData[] = await response.json();
        

        // canvas 요소 가져오기
        const canvas = document.getElementById(`chart-${symbol}`) as HTMLCanvasElement;
        if (!canvas) {
            console.error(`Canvas not found for ${symbol}`);
            return;
        }

        // 차트 생성
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    data: data.map(d => d.close),
                    borderColor: 'rgb(3, 123, 75);',
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false, grid: { display: false } },
                    y: { display: false, grid: { display: false } }
                }
            }
        });
    } catch (error) {
        error
    }
}

// 페이지 로드 시 각 지수에 대한 차트 생성
document.addEventListener('DOMContentLoaded', () => {
    const indices = ['^IXIC', '^GSPC', '^DJI'];
    indices.forEach(symbol => {
        createMarketChart(symbol);
    });
});