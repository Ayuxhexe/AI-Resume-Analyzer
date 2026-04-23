import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#648075',
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#648075' },
      grid: { color: 'rgba(120, 142, 136, 0.12)' },
    },
    y: {
      ticks: { color: '#648075' },
      grid: { color: 'rgba(120, 142, 136, 0.12)' },
    },
  },
};

const AnalysisCharts = ({ analyses = [], latestAnalysis }) => {
  const latestScore = latestAnalysis?.score || 0;
  const history = analyses.slice(0, 6).reverse();

  const scoreDoughnut = {
    labels: ['ATS Score', 'Remaining'],
    datasets: [
      {
        data: [latestScore, Math.max(0, 100 - latestScore)],
        backgroundColor: ['#14b8a6', '#d6e4dd'],
        borderWidth: 0,
      },
    ],
  };

  const trendLine = {
    labels: history.map((analysis, index) => `Run ${index + 1}`),
    datasets: [
      {
        label: 'ATS Score',
        data: history.map((analysis) => analysis.score),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.14)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Job Match',
        data: history.map((analysis) => analysis.jobMatch?.percentage ?? null),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        tension: 0.35,
      },
    ],
  };

  const skillsBar = {
    labels: ['Skills Found', 'Missing Skills', 'Job Match %'],
    datasets: [
      {
        label: 'Current Snapshot',
        data: [
          latestAnalysis?.skills?.length || 0,
          latestAnalysis?.missingSkills?.length || 0,
          latestAnalysis?.jobMatch?.percentage || 0,
        ],
        backgroundColor: ['#14b8a6', '#fb7185', '#f59e0b'],
        borderRadius: 14,
      },
    ],
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr,1.25fr]">
      <div className="glass-panel-strong p-5">
        <h3 className="section-title text-text">ATS Score Snapshot</h3>
        <div className="mt-5 h-64">
          <Doughnut
            data={scoreDoughnut}
            options={{
              cutout: '72%',
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-text-soft">
          A higher ATS score suggests stronger readability and alignment.
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel-strong p-5">
          <h3 className="section-title text-text">Recent Trend</h3>
          <div className="mt-5 h-56">
            <Line data={trendLine} options={chartOptions} />
          </div>
        </div>

        <div className="glass-panel-strong p-5">
          <h3 className="section-title text-text">Coverage vs Gap</h3>
          <div className="mt-5 h-56">
            <Bar data={skillsBar} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
