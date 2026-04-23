import { ArrowUpRight, CheckCircle2, FileText, Gauge, Sparkles, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AnalysisCharts from '../components/AnalysisCharts.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SkillBadge from '../components/SkillBadge.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import analysisService from '../services/analysisService.js';
import { buildAssetUrl, extractApiErrorMessage } from '../services/api.js';
import resumeService from '../services/resumeService.js';

const AnalysisResultPage = () => {
  const { resumeId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(state?.analysis || null);
  const [resume, setResume] = useState(state?.resume || null);
  const [analyses, setAnalyses] = useState(analysis ? [analysis] : []);
  const [isLoading, setIsLoading] = useState(!state?.analysis);

  useEffect(() => {
    if (state?.analysis) {
      return;
    }

    const loadResult = async () => {
      try {
        const [resumeData, analysesData] = await Promise.all([
          resumeService.getResume(resumeId),
          analysisService.getUserAnalyses(user._id),
        ]);

        const matchingAnalyses = analysesData.filter(
          (entry) => entry.resumeId?._id === resumeId || entry.resumeId === resumeId,
        );

        setResume(resumeData);
        setAnalyses(analysesData);
        setAnalysis(matchingAnalyses[0] || analysesData[0] || null);
      } catch (error) {
        toast.error(extractApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [resumeId, state?.analysis, user?._id]);

  if (isLoading) {
    return <LoadingSpinner label="Loading analysis result..." />;
  }

  if (!analysis) {
    return (
      <div className="glass-panel-strong p-8 text-center">
        <h2 className="font-heading text-3xl font-semibold text-text">Analysis not found</h2>
        <p className="mt-3 text-text-soft">
          The requested result could not be loaded. Run a new resume analysis to create fresh insights.
        </p>
        <Link
          to="/upload"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-text px-5 py-3 text-sm font-semibold text-white"
        >
          Upload another resume
          <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  }

  const resumeFileUrl = buildAssetUrl(resume?.fileUrl || analysis.resumeId?.fileUrl || '');

  return (
    <div className="space-y-8">
      <section className="glass-panel-strong p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-soft">
              Analysis Result
            </p>
            <h2 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-text">
              Resume insights ready for review
            </h2>
            <p className="mt-3 max-w-3xl text-text-soft">
              This view combines ATS scoring, extracted skills, AI-generated improvement steps,
              and job match recommendations when a job description was provided.
            </p>
          </div>

          {resumeFileUrl ? (
            <a
              href={resumeFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text transition hover:bg-white/40 dark:hover:bg-white/5"
            >
              <FileText size={16} />
              Open uploaded resume
            </a>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="ATS Score"
          value={`${analysis.score}/100`}
          description="Score produced from AI-driven resume analysis."
          tone="teal"
        />
        <SummaryCard
          title="Job Match"
          value={`${analysis.jobMatch?.percentage || 0}%`}
          description="Visible when a job description comparison was included."
          tone="amber"
        />
        <SummaryCard
          title="Skills Extracted"
          value={analysis.skills?.length || 0}
          description="Distinct skills parsed from the resume content."
          tone="coral"
        />
        <SummaryCard
          title="Missing Skills"
          value={analysis.missingSkills?.length || 0}
          description="Skill gaps surfaced by the job matching pass."
          tone="slate"
        />
      </section>

      <AnalysisCharts analyses={analyses.length ? analyses : [analysis]} latestAnalysis={analysis} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <div className="glass-panel-strong p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-500/10 p-3 text-accent">
                <Gauge size={20} />
              </div>
              <div>
                <h3 className="section-title text-text">Experience Summary</h3>
                <p className="text-sm text-text-soft">
                  Condensed professional story generated from the uploaded resume.
                </p>
              </div>
            </div>
            <p className="mt-5 leading-7 text-text-soft">{analysis.experienceSummary}</p>
          </div>

          <div className="glass-panel-strong p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-warm">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="section-title text-text">Improvement Suggestions</h3>
                <p className="text-sm text-text-soft">
                  Practical next steps to strengthen the resume.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {analysis.suggestions?.map((suggestion) => (
                <div key={suggestion} className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 text-accent" size={18} />
                    <p className="text-sm text-text">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel-strong p-6">
            <h3 className="section-title text-text">Skills Found</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {analysis.skills?.map((skill) => (
                <SkillBadge key={skill} label={skill} variant="primary" />
              ))}
            </div>
          </div>

          <div className="glass-panel-strong p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">
                <Target size={20} />
              </div>
              <div>
                <h3 className="section-title text-text">Missing Skills</h3>
                <p className="text-sm text-text-soft">Skills the job comparison suggests you should address.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {analysis.missingSkills?.length ? (
                analysis.missingSkills.map((skill) => (
                  <SkillBadge key={skill} label={skill} variant="danger" />
                ))
              ) : (
                <p className="text-sm text-text-soft">
                  No skill gap analysis was saved for this run.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel-strong p-6">
            <h3 className="section-title text-text">Job Match Recommendations</h3>
            <div className="mt-5 space-y-3">
              {analysis.jobMatch?.recommendations?.length ? (
                analysis.jobMatch.recommendations.map((recommendation) => (
                  <div key={recommendation} className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
                    <p className="text-sm text-text">{recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-soft">
                  Add a job description during upload to receive tailored match recommendations.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisResultPage;
