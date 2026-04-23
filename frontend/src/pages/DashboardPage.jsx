import { ArrowRight, BriefcaseBusiness, FileSearch, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnalysisCharts from '../components/AnalysisCharts.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { extractApiErrorMessage } from '../services/api.js';
import analysisService from '../services/analysisService.js';

const DashboardPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await analysisService.getUserAnalyses(user._id);
        setAnalyses(data);
      } catch (error) {
        toast.error(extractApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user?._id]);

  if (isLoading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  const latestAnalysis = analyses[0];
  const bestMatch = analyses.reduce(
    (highest, analysis) => Math.max(highest, analysis.jobMatch?.percentage || 0),
    0,
  );

  if (!latestAnalysis) {
    return (
      <div className="glass-panel-strong p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-accent">
          <FileSearch size={28} />
        </div>
        <h2 className="mt-6 font-heading text-3xl font-semibold text-text">No resume analyses yet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-text-soft">
          Upload your first PDF resume to generate an ATS score, extract skills, compare against
          job descriptions, and unlock recommendation charts here.
        </p>
        <Link
          to="/upload"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-text px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Upload your first resume
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Latest ATS Score"
          value={`${latestAnalysis.score}/100`}
          description="The most recent AI-generated ATS estimate for your latest uploaded resume."
          tone="teal"
        />
        <SummaryCard
          title="Best Job Match"
          value={`${bestMatch || 0}%`}
          description="Strongest match percentage discovered across all job-comparison runs."
          tone="amber"
        />
        <SummaryCard
          title="Analyses Run"
          value={analyses.length}
          description="Every resume analysis and JD comparison run stored for this account."
          tone="coral"
        />
        <SummaryCard
          title="Missing Skills"
          value={latestAnalysis.missingSkills?.length || 0}
          description="Skills the latest analysis flagged as gaps against the tracked opportunity."
          tone="slate"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="space-y-6">
          <AnalysisCharts analyses={analyses} latestAnalysis={latestAnalysis} />

          <div className="glass-panel-strong p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title text-text">Latest Recommendations</h2>
                <p className="mt-1 text-sm text-text-soft">
                  Actionable changes suggested by the analysis engine for your most recent resume.
                </p>
              </div>
              {latestAnalysis.resumeId?._id ? (
                <Link
                  to={`/analysis/result/${latestAnalysis.resumeId._id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/40 dark:hover:bg-white/5"
                >
                  View full result
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {latestAnalysis.suggestions?.map((suggestion) => (
                <div key={suggestion} className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
                  <p className="text-sm text-text">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel-strong p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-500/10 p-3 text-accent">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="section-title text-text">Skills Extracted</h2>
                <p className="text-sm text-text-soft">Top strengths pulled from your latest resume.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {latestAnalysis.skills?.map((skill) => (
                <SkillBadge key={skill} label={skill} variant="primary" />
              ))}
            </div>
          </div>

          <div className="glass-panel-strong p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <h2 className="section-title text-text">Missing Skills</h2>
                <p className="text-sm text-text-soft">Gaps detected during the latest job match run.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {latestAnalysis.missingSkills?.length ? (
                latestAnalysis.missingSkills.map((skill) => (
                  <SkillBadge key={skill} label={skill} variant="danger" />
                ))
              ) : (
                <p className="text-sm text-text-soft">
                  No missing skills were recorded yet. Add a job description on the upload page to see a gap analysis.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel-strong p-6">
            <h2 className="section-title text-text">Experience Summary</h2>
            <p className="mt-4 leading-7 text-text-soft">{latestAnalysis.experienceSummary}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
