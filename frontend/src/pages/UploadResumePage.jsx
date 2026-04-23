import { FileWarning, LoaderCircle, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FileDropzone from '../components/FileDropzone.jsx';
import { extractApiErrorMessage } from '../services/api.js';
import analysisService from '../services/analysisService.js';
import resumeService from '../services/resumeService.js';

const UploadResumePage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a PDF resume before starting the analysis.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResponse = await resumeService.uploadResume(selectedFile);
      const analysisResponse = await analysisService.analyzeResume({
        resumeId: uploadResponse.resume._id,
      });

      let finalAnalysis = analysisResponse.analysis;
      let jobMatchResult = null;

      if (jobDescription.trim()) {
        const jobMatchResponse = await analysisService.matchResumeToJob({
          resumeId: uploadResponse.resume._id,
          jobDescription,
        });

        finalAnalysis = jobMatchResponse.analysis;
        jobMatchResult = jobMatchResponse.result;
      }

      toast.success(
        jobDescription.trim()
          ? 'Resume analyzed and matched against the job description.'
          : 'Resume analyzed successfully.',
      );

      navigate(`/analysis/result/${uploadResponse.resume._id}`, {
        state: {
          resume: uploadResponse.resume,
          analysis: finalAnalysis,
          analysisResult: analysisResponse.result,
          jobMatchResult,
        },
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <section className="space-y-6">
        <div className="glass-panel-strong p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-500/10 p-3 text-accent">
              <WandSparkles size={20} />
            </div>
            <div>
              <h2 className="section-title text-text">Upload Resume</h2>
              <p className="text-sm text-text-soft">
                Drag in a PDF resume, then optionally paste a job description to compare fit.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <FileDropzone file={selectedFile} onFileSelect={setSelectedFile} />
          </div>
        </div>

        <div className="glass-panel-strong p-6 sm:p-8">
          <h2 className="section-title text-text">Why add a job description?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
              <p className="font-semibold text-text">See match percentage</p>
              <p className="mt-2 text-sm text-text-soft">Estimate how well the resume aligns with the role.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
              <p className="font-semibold text-text">Catch missing skills</p>
              <p className="mt-2 text-sm text-text-soft">Find gaps before the application reaches ATS filters.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
              <p className="font-semibold text-text">Improve targeting</p>
              <p className="mt-2 text-sm text-text-soft">Get recommendations that are specific to the chosen opening.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel-strong p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-soft">Optional JD Match</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-text">
              Paste a job description to compare against the uploaded resume
            </h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text">Job Description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={16}
              placeholder="Paste the role summary, responsibilities, required skills, and preferred qualifications here."
              className="w-full rounded-3xl border border-border bg-white/45 px-4 py-4 text-text outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:bg-white/5"
            />
          </label>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <FileWarning className="mt-0.5" size={18} />
              <p>
                If you leave the job description empty, the app will still run ATS scoring,
                skills extraction, experience summarization, and suggestions.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-text px-5 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Running upload and analysis...
              </>
            ) : (
              <>
                Start analysis
                <WandSparkles size={18} />
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default UploadResumePage;
