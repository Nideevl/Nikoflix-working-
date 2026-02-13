'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { Lock, Play, Zap, X, Shield, Server, Database, Github, CreditCard, Cpu } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user has demo access on mount
  useEffect(() => {
    const storedCode = localStorage.getItem('demo_access_code');
    const validCode = process.env.NEXT_PUBLIC_DEMO_CODE;

    if (storedCode === validCode) {
      setHasAccess(true);
    }
    setIsChecking(false);
  }, []);

  const handleDemoCodeSubmit = () => {
    const validCode = process.env.NEXT_PUBLIC_DEMO_CODE;

    if (!demoCode.trim()) {
      setError('Please enter a demo code');
      return;
    }

    if (demoCode === validCode) {
      localStorage.setItem('demo_access_code', demoCode);
      setHasAccess(true);
      setShowDemoModal(false);
      setError('');
      setDemoCode('');
    } else {
      setError('Invalid demo code. Please try again.');
    }
  };

  const handleProtectedNavigation = (path: string) => {
    if (!hasAccess) {
      setShowDemoModal(true);
    } else {
      router.push(path);
    }
  };

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showDemoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDemoModal]);

  // 1. Add state for the 4-digit array
  const [otp, setOtp] = useState(['', '', '', '']);

  // 2. Add handler for input changes
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Update the main demoCode state for your existing submit logic
    setDemoCode(newOtp.join(''));

    // Auto-focus next input
    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // 3. Add handler for backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const target = (e.currentTarget.previousSibling as HTMLInputElement);
        target.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // numbers only
    if (!pastedData) return;

    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (index + i < newOtp.length) {
        newOtp[index + i] = pastedData[i];
      }
    }

    setOtp(newOtp);
    setDemoCode(newOtp.join(""));

    // focus last filled input
    const nextIndex = Math.min(index + pastedData.length, otp.length - 1);
    const nextInput = document.querySelectorAll<HTMLInputElement>('input[type="text"]')[nextIndex];
    nextInput?.focus();
  };


  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white selection:bg-red-600/40 selection:text-white overflow-x-hidden">
        {/* Cinematic Background Layer */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/4371a395-0e42-46ae-be36-5755eebc638b/web/IN-en-20260209-TRIFECTA-perspective_3a6d8659-ddfe-4547-9584-dce64c02c230_large.jpg)',
          }}
        />

        {/* Dark Overlay Gradients */}
        <div className="fixed inset-0 bg-black/60 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#450a0a_0%,transparent_100%)] pointer-events-none opacity-40" />
        <div className="fixed inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-black pointer-events-none" />
        {/* Navbar */}
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/logo.svg"
                  alt="NIKOFLIX"
                  width={100}
                  height={20}
                  className="h-7 w-auto logo-img transition-transform group-hover:scale-105"
                />
                <span className="logo-text text-red-600 text-2xl font-black tracking-tighter drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]">
                  NikoFlix
                </span>
              </Link>

              {/* Nav Actions */}
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handleProtectedNavigation('/auth?step=login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleProtectedNavigation('/browse')}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                  Get Started
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          {/* Floating Orbs Background Effect */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '3s', animationDelay: '1.5s' }} />

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            {/* Demo Access Badge */}
            {!isChecking && (
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${hasAccess
                ? 'bg-green-500/5 border-green-500/20 text-green-500'
                : 'bg-red-600/5 border-red-600/20 text-red-500'
                }`}>
                {hasAccess ? <Shield size={12} strokeWidth={3} /> : <Lock size={12} strokeWidth={3} />}
                {hasAccess ? 'Access Verified' : 'Private Beta Environment'}
              </div>
            )}

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight">
              <span className="block text-white mb-2">UNLIMITED MOVIES,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 uppercase">
                SHOWS <span className="text-5xl align-middle mx-1 text-neutral-300">&</span> MORE
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
              Stream anywhere. Cancel anytime. Experience cinema like never before.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => handleProtectedNavigation('/auth?step=signup')}
                className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white text-lg font-black rounded-sm transition-all border border-white/10 active:scale-95 w-full sm:w-auto uppercase tracking-tight"
              >
                Create Account
              </button>
              <button
                onClick={() => handleProtectedNavigation('/browse')}
                className="group px-10 py-4  bg-red-600 hover:bg-red-700 text-white text-lg font-black rounded-sm transition-all active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center uppercase tracking-tight"
              >
                <Play size={20} fill="white" />
                Start Watching
              </button>
            </div>
          </div>
        </section>

        {/* Technical Architecture Section */}
        <section className="relative py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tighter uppercase">
                Enterprise Infrastructure
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                A production-ready streaming platform with automated ingestion, global CDN delivery, and secure payment processing
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
              {/* Video Processing Pipeline */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <Cpu size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  Automated Pipeline
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Automated media resolution, FFmpeg transcoding, and adaptive HLS stream generation with retry-safe workflows
                </p>
              </div>

              {/* Global CDN */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  Global CDN Delivery
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  BunnyCDN for low-latency worldwide streaming with secure token authentication to prevent hotlinking
                </p>
              </div>

              {/* Cloud Infrastructure */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <Server size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  Oracle Cloud
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Backend, ingestion workers, and services deployed on Oracle Cloud VMs with CI/CD automation
                </p>
              </div>

              {/* Secure Payments */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  Secure Payments
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Razorpay integration for automated billing, subscriptions and safe transaction handling
                </p>
              </div>

              {/* Database Architecture */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <Database size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  PostgreSQL Core
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Structured relational data architecture for content, users, subscriptions, and analytics
                </p>
              </div>

              {/* CI/CD */}
              <div className="bg-[#0a0a0a] p-8 hover:bg-[#0f0f0f] transition-colors group">
                <div className="text-red-600 mb-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300">
                  <Github size={24} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">
                  CI/CD Automation
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Automated build, testing, and multi-VM deployment pipelines via GitHub Actions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-red-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter uppercase">
                Ready to watch?
              </h2>
              <p className="text-lg sm:text-xl text-gray-500 mb-10">
                Join millions of viewers worldwide. Start your journey today.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/browse')}
                className="px-14 py-6 bg-red-600 hover:bg-red-700 text-white text-xl font-black rounded-sm transition-all active:scale-95 shadow-[0_20px_50px_rgba(220,38,38,0.3)] uppercase tracking-tight"
              >
                Join NikoFlix Now
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/50 py-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-600 text-sm font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} NikoFlix Engineering — All Rights Reserved
            </p>
          </div>
        </footer>
      </main>

      {/* Demo Code Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowDemoModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-neutral-900 to-black border border-red-900/50 rounded-2xl p-8 shadow-2xl shadow-red-600/20">
            {/* Close Button */}
            <button onClick={() => setShowDemoModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/20">
                <Lock size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Enter Access Key</h3>
              <p className="text-gray-500 text-sm mt-1">4-digit code required to enter.</p>
            </div>

            {/* OTP Input Grid */}
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    className="w-14 h-16 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all uppercase"
                    autoFocus={index === 0}
                  />
                ))}

              </div>

              {error && (
                <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-3 rounded border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                onClick={handleDemoCodeSubmit}
                disabled={otp.some(digit => digit === '')}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/20"
              >
                VERIFY ACCESS
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Don't have a demo code? Contact the administrator.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}