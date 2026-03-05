const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const csvFilePath = path.resolve(process.cwd(), 'reports', 'exchange_rates.csv');

// Чтение CSV
function readCsv(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(';');
    
    return lines.slice(1).map(line => {
        const values = line.split(';');
        return {
            DATE: values[0],
            Time: values[1],
            Kurs: parseFloat(values[2]?.replace(',', '.')) || null,
            Kurs_EUR: parseFloat(values[3]?.replace(',', '.')) || null // Предполагаем, что евро — в 4-м столбце
        };
    }).filter(row => !isNaN(row.Kurs) || !isNaN(row.Kurs_EUR));
}

async function generateChart() {
    const data = readCsv(csvFilePath);
    if (data.length === 0) {
        console.log('Нет данных для построения графика');
        return;
    }

    // Объединяем дату и время
    const labels = data.map(d => `${d.DATE} ${d.Time}`);

    // Подготавливаем данные
    const dollarRates = data.map(d => d.Kurs);
    const euroRates = data.map(d => d.Kurs_EUR);

    const width = 1200;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Курс доллара (USD/RUB)',
                    data: dollarRates,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Курс евро (EUR/RUB)',
                    data: euroRates,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Динамика курсов доллара и евро (Яндекс)'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 15
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value) => value.toFixed(2) + ' ₽'
                    }
                }
            }
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    const chartPath = path.resolve(process.cwd(), 'reports', 'exchange_chart.png');
    fs.writeFileSync(chartPath, image);
    console.log(`График сохранён: ${chartPath}`);
    return chartPath;
}

module.exports = { generateChart };