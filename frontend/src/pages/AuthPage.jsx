import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Stars,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { extractApiErrorMessage } from '../services/api.js';

const trustPoints = [
  'AI-scored ATS readiness in seconds',
  'Job-match gap analysis with missing skills',
  'OTP verification before dashboard access',
];

const socialProof = [
  { label: 'Profiles screened', value: '18k+' },
  { label: 'Interview hit rate', value: '2.4x' },
  { label: 'Resume improvements', value: '91%' },
];

const reviews = [
  {
    name: 'Neha, Product Designer',
    quote:
      'The job-match feedback helped me tailor my resume in one pass instead of guessing what recruiters wanted.',
  },
  {
    name: 'Arjun, Backend Engineer',
    quote:
      'The ATS score plus missing-skills view made the app feel like a serious career tool, not a demo.',
  },
];

const maskEmail = (email = '') => {
  const [name, domain] = email.split('@');

  if (!name || !domain) {
    return email;
  }

  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }

  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};

const AuthPage = () => {
  const { isAuthenticated, googleSignIn, login, register, resendOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('auth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [verificationSession, setVerificationSession] = useState(null);

  const isBusy = isSubmitting || isGoogleSubmitting;
  const pageTitle =
    mode === 'register'
      ? 'Create an account and verify your email'
      : 'Sign in and continue to your dashboard';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const startOtpStep = (response, fallbackMessage) => {
    setVerificationSession(response);
    setOtpCode('');
    setStep('otp');
    toast.success(response.message || fallbackMessage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response =
        mode === 'register'
          ? await register(formData)
          : await login({
              email: formData.email,
              password: formData.password,
            });

      if (response?.requiresOtp) {
        startOtpStep(
          response,
          mode === 'register'
            ? 'Account created. Check your email for the OTP.'
            : 'Check your email for the OTP to continue.',
        );
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setIsGoogleSubmitting(true);

    try {
      const response = await googleSignIn({ credential });

      if (response?.requiresOtp) {
        startOtpStep(response, 'Google sign-in accepted. Check your email for the OTP.');
      }
    } catch (error) {
      toast.error(extractApiErrorMessage(error));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await verifyOtp({
        verificationToken: verificationSession?.verificationToken,
        otp: otpCode,
      });

      toast.success(response.message || 'Verification complete.');
    } catch (error) {
      toast.error(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await resendOtp({
        verificationToken: verificationSession?.verificationToken,
      });

      setVerificationSession(response);
      toast.success(response.message || 'A fresh OTP has been sent.');
    } catch (error) {
      toast.error(extractApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  const goBackToAuth = () => {
    setStep('auth');
    setOtpCode('');
  };

  return (
    <div className="min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="glass-panel-strong relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-mesh-grid bg-[size:32px_32px] opacity-20" />
          <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-200">
              <Sparkles size={16} />
              AI resume intelligence for real job hunts
            </div>

            <h1 className="mt-8 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              Build stronger applications with a login flow that feels like a real product.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-soft">
              Upload resumes, compare them against job descriptions, and step into your dashboard
              through a polished email or Google sign-in flow with OTP verification.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {socialProof.map((item) => (
                <div key={item.label} className="glass-panel p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-soft">
                    {item.label}
                  </p>
                  <p className="mt-3 font-heading text-4xl font-semibold text-text">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-teal-500/10 p-3 text-accent">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-text-soft">
                      What you unlock
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold text-text">
                      High-signal hiring insights
                    </h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {trustPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 text-accent" size={18} />
                      <p className="text-base text-text-soft">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.name} className="glass-panel p-5">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Stars size={16} fill="currentColor" />
                      <Stars size={16} fill="currentColor" />
                      <Stars size={16} fill="currentColor" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-text-soft">"{review.quote}"</p>
                    <p className="mt-4 text-sm font-semibold text-text">{review.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel-strong relative flex items-center px-6 py-8 sm:px-8">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-500/10 to-transparent" />
          <div className="relative w-full">
            {step === 'auth' ? (
              <>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/40 px-4 py-2 text-sm font-semibold text-text dark:bg-white/5">
                  <LockKeyhole size={16} />
                  JWT auth with email OTP verification
                </div>

                <h2 className="font-heading text-3xl font-semibold tracking-tight text-text">
                  {pageTitle}
                </h2>
                <p className="mt-3 text-text-soft">
                  Continue with email and password or use Google, then verify the OTP sent to your
                  inbox before entering the app.
                </p>

                <div className="mt-6 flex rounded-full border border-border bg-white/45 p-1 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      mode === 'login'
                        ? 'bg-[#10261f] text-white dark:bg-accent dark:text-slate-950'
                        : 'text-text-soft'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      mode === 'register'
                        ? 'bg-[#10261f] text-white dark:bg-accent dark:text-slate-950'
                        : 'text-text-soft'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <div className="mt-6">
                  <GoogleSignInButton
                    mode={mode}
                    isBusy={isBusy}
                    onCredential={handleGoogleCredential}
                  />
                </div>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-text-soft">
                    Or use email
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'register' ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-text">Full Name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-border bg-white/50 px-4 py-3 text-text outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:bg-white/5"
                        placeholder="Aarav Sharma"
                      />
                    </label>
                  ) : null}

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-border bg-white/50 px-4 py-3 text-text outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:bg-white/5"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">Password</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full rounded-2xl border border-border bg-white/50 px-4 py-3 text-text outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:bg-white/5"
                      placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10261f] px-5 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0b1a16] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent dark:text-slate-950 dark:hover:bg-[#6ef0a9]"
                  >
                    {isSubmitting
                      ? 'Sending OTP...'
                      : mode === 'register'
                        ? 'Create account and continue'
                        : 'Sign in and continue'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goBackToAuth}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/35 dark:hover:bg-white/5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-700 dark:text-teal-200">
                  <MailCheck size={16} />
                  Verification required
                </div>

                <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-text">
                  Enter the OTP sent to {maskEmail(verificationSession?.email)}
                </h2>
                <p className="mt-3 text-text-soft">
                  We sent a six-digit code to your email. Enter it below to finish signing in and
                  unlock the dashboard.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-accent" size={18} />
                      <div>
                        <p className="text-sm font-semibold text-text">Extra protection</p>
                        <p className="text-xs text-text-soft">OTP verification guards account access.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/35 p-4 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Clock3 className="text-amber-500" size={18} />
                      <div>
                        <p className="text-sm font-semibold text-text">10 minute validity</p>
                        <p className="text-xs text-text-soft">You can resend a new code if needed.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOtpSubmit} className="mt-8 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-text">Verification Code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(event) =>
                        setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      required
                      className="w-full rounded-2xl border border-border bg-white/50 px-4 py-4 text-center font-heading text-3xl tracking-[0.45em] text-text outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 dark:bg-white/5"
                      placeholder="000000"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10261f] px-5 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0b1a16] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-accent dark:text-slate-950 dark:hover:bg-[#6ef0a9]"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify and continue'}
                    <ArrowRight size={18} />
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-text transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-white/5"
                >
                  {isResending ? 'Sending a new code...' : 'Resend OTP'}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
