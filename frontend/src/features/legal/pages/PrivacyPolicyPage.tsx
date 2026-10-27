// src/features/legal/pages/PrivacyPolicyPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Database,
  Server,
  UserCheck,
  Mail,
  AlertCircle,
  CheckCircle2,
  Calendar,
  HeartPulse,
  Scale,
  Dumbbell,
  FileText,
  Trash2,
  Eye,
  Layers,
  ChevronRight,
} from "lucide-react";

import { LegalNavbar } from "../components/LegalNavbar";
import { LegalFooter } from "../components/LegalFooter";
import { PlaceholderBadge } from "../components/PlaceholderBadge";

const TOC_SECTIONS = [
  { id: "overview", title: "1. Overview & Scope" },
  { id: "data-we-collect", title: "2. Information We Collect" },
  { id: "google-data", title: "3. Google Sign-In & Third-Party Auth" },
  { id: "fitness-data", title: "4. Fitness, Workout & Biometric Data" },
  { id: "how-we-use-data", title: "5. How We Use Your Information" },
  { id: "infrastructure", title: "6. Storage, Hosting & Infrastructure" },
  { id: "role-visibility", title: "7. Role-Based Visibility & Consent" },
  { id: "security-limitations", title: "8. Security Safeguards & Limitations" },
  { id: "retention", title: "9. Data Retention" },
  { id: "deletion-procedure", title: "10. Account & Data Deletion Requests" },
  { id: "children", title: "11. Children's Privacy" },
  { id: "policy-changes", title: "12. Changes to This Policy" },
  { id: "contact-information", title: "13. Privacy Contact & Placeholders" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    TOC_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#090B0F] text-[#F3F4F6] selection:bg-[#5BE584] selection:text-[#090B0F] font-sans">
      <LegalNavbar />

      {/* Hero Header */}
      <section className="relative border-b border-[#2A3039] bg-gradient-to-b from-[#13171D] via-[#0D1014] to-[#090B0F] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3.5 py-1 text-xs font-semibold text-[#5BE584] w-fit">
              <Shield className="h-3.5 w-3.5" />
              <span>STREN TRUST & TRANSPARENCY</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F8FAFC]">
              Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              This Privacy Policy explains how STREN collects, uses, processes, stores, and protects your
              personal, workout, and biometric information when you access or use the STREN Gym Management Platform.
            </p>

            {/* Document Metadata Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-[#2A3039]/80 pt-4 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#5BE584]" />
                <span>Effective Date: <strong>October 28, 2026</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span>Scope: <strong>Members, Coaches, and Visitors</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Version: <strong>1.0 (Production Architecture)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Banner: Placeholders Required */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-[1280px] flex items-start sm:items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Administrator Notice:</strong> Highlighted tags like{" "}
            <PlaceholderBadge label="[LEGAL_COMPANY_NAME]" field="Legal Entity Name" /> indicate
            business and contact placeholders that the gym or platform owner must replace with their official
            registered corporate details prior to formal legal release.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Table of Contents Sticky Sidebar (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 rounded-2xl border border-[#2A3039] bg-[#0E1217] p-5 shadow-lg">
            <div className="flex items-center gap-2 border-b border-[#2A3039] pb-3 mb-4">
              <FileText className="h-4 w-4 text-[#5BE584]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                Table of Contents
              </h3>
            </div>

            <nav aria-label="Privacy Table of Contents" className="space-y-1">
              {TOC_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollTo(section.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                      isActive
                        ? "bg-[#5BE584]/15 font-semibold text-[#5BE584]"
                        : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]"
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <ChevronRight
                      className={`h-3 w-3 shrink-0 transition ${
                        isActive
                          ? "opacity-100 text-[#5BE584]"
                          : "opacity-0 group-hover:opacity-100 text-[#94A3B8]"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#2A3039] flex flex-col gap-2">
              <span className="text-[11px] text-[#94A3B8]">Need the Terms of Service?</span>
              <Link
                to="/terms-of-service"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584] hover:underline"
              >
                <span>Read Terms of Service</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Document Content */}
          <article className="flex-1 max-w-3xl space-y-14 text-sm text-[#CBD5E1] leading-relaxed">
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Shield className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  1. Overview & Scope
                </h2>
              </div>
              <p>
                Welcome to <strong>STREN</strong> (&ldquo;STREN,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
                operated by <PlaceholderBadge label="[LEGAL_COMPANY_NAME: STREN Gym Management Platform LLC]" field="Company Name" />.
                STREN provides a specialized, closed-loop strength coaching platform that brings coaches and athletes
                together through precision workout programming, live session execution, previous lift benchmarking,
                biometric measurement tracking, and real-time coaching collaboration.
              </p>
              <p>
                This Privacy Policy applies to all individuals who access our services, including athletes and gym
                members (&ldquo;Members&rdquo;), personal trainers and strength coaches (&ldquo;Coaches&rdquo;), gym administrators
                (&ldquo;Admins&rdquo;), and public website visitors (&ldquo;Visitors&rdquo;). By creating an account or accessing
                STREN, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-we-collect" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <UserCheck className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  2. Information We Collect
                </h2>
              </div>
              <p>
                We collect personal information necessary to deliver our coaching and training management services.
                Depending on how you interact with STREN, we collect:
              </p>

              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#5BE584]/20 text-[11px] font-bold text-[#5BE584]">A</span>
                  Account & Profile Information
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#94A3B8]">
                  <li>
                    <strong className="text-[#F8FAFC]">Identity Details:</strong> Full name, email address, and optional phone number.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Security Credentials:</strong> Passwords are cryptographically salted and hashed using bcrypt before storage. Raw passwords are never stored in plaintext or readable by STREN personnel.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Coaching Credentials (for Coaches):</strong> Professional title, biographical statement, coaching philosophy, years of experience, professional specialties, certifications, and languages spoken.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Athlete Preferences (for Members):</strong> Stated fitness goals (e.g., strength, hypertrophy, athletic conditioning), experience level, and onboarding intake responses.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Account Role:</strong> System classification as <code className="text-[#5BE584]">member</code>, <code className="text-[#5BE584]">trainer</code>, or <code className="text-[#5BE584]">admin</code>.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="google-data" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Lock className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  3. Google Sign-In & Third-Party Authentication
                </h2>
              </div>
              <p>
                STREN allows users to sign in or register seamlessly using Google Identity Services (OAuth 2.0).
                When you use Google Sign-In, we adhere strictly to the principle of minimal data access:
              </p>

              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Google Identity Scopes & Stored Fields</h3>
                <p className="text-xs text-[#94A3B8]">
                  Our backend verifies the cryptographically signed ID Token returned by Google. We only store:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-lg border border-[#1E2329] bg-[#0A0D11] p-3 text-xs">
                    <span className="font-semibold text-[#5BE584] block mb-1">Google ID (sub)</span>
                    <span className="text-[#94A3B8]">Unique numeric identifier used exclusively to link your account.</span>
                  </div>
                  <div className="rounded-lg border border-[#1E2329] bg-[#0A0D11] p-3 text-xs">
                    <span className="font-semibold text-[#5BE584] block mb-1">Email Address</span>
                    <span className="text-[#94A3B8]">Verified Google email used for account identification and login.</span>
                  </div>
                  <div className="rounded-lg border border-[#1E2329] bg-[#0A0D11] p-3 text-xs">
                    <span className="font-semibold text-[#5BE584] block mb-1">Display Name</span>
                    <span className="text-[#94A3B8]">Name provided by your Google account to populate your profile.</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>What We Do NOT Access:</strong> STREN does <em>not</em> request, access, read, or store your Gmail messages,
                    Google Drive documents, Google Contacts, Google Calendar events, photos, or browsing history.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="fitness-data" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Dumbbell className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  4. Fitness, Workout & Biometric Data
                </h2>
              </div>
              <p>
                As a gym management and training platform, STREN records detailed workout logs and physical measurements
                that you or your assigned coach provide:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4.5 space-y-2">
                  <h4 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-[#5BE584]" />
                    Workout Session Logs & Performance Benchmarks
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    When you conduct workouts, we record: exercises performed, prescribed targets (target weight, target RPE, target reps),
                    actual sets logged (completed reps, logged load in kg/lbs, logged RPE), set completion timestamps, session duration,
                    overall session difficulty rating, coach feedback, and in-session exercise swaps including athlete-provided reasons
                    (e.g., equipment unavailability or joint discomfort).
                  </p>
                </div>

                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4.5 space-y-2">
                  <h4 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                    <Scale className="h-4 w-4 text-purple-400" />
                    Biometric & Body Measurements
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    If you choose to track physical progress, STREN records: body weight, height, estimated body fat percentage,
                    circumference measurements (chest, waist, hips, arms, thighs, calves, shoulders, neck), measurement timestamps,
                    and optional progress photos stored in secure storage.
                  </p>
                </div>

                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4.5 space-y-2">
                  <h4 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    Nutrition & Dietary Information
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    When utilizing nutrition features, we store coach-assigned or self-defined daily calorie and macronutrient targets
                    (protein, carbohydrates, fats), logged meals, hydration logs, and dietary restrictions or notes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="how-we-use-data" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Database className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  5. How We Use Your Information
                </h2>
              </div>
              <p>
                We use the data we collect strictly to operate, maintain, and enhance the STREN platform:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#CBD5E1]">
                <li>
                  <strong>Executing the Closed Coaching Loop:</strong> Allowing coaches to build routines, prescribe target loads and RPEs, assign them to athletes, and review completed sessions.
                </li>
                <li>
                  <strong>Benchmarking & Live Guidance:</strong> Surfacing your historical personal bests and previous workout weights during active sessions so you know what load to lift next.
                </li>
                <li>
                  <strong>Volume & Telemetry Computation:</strong> Calculating total volume, weekly adherence rates, streak counters, and performance graphs in Member and Coach Dashboards.
                </li>
                <li>
                  <strong>Real-Time Notifications & Scheduling:</strong> Dispatching notifications for new assignments, completed workouts, schedule changes, and unlocked achievements via WebSockets and in-app alerts.
                </li>
                <li>
                  <strong>Account Security:</strong> Verifying email ownership via OTP codes, delivering password reset tokens, and enforcing authenticated role-based access control.
                </li>
              </ul>

              <div className="rounded-xl border border-[#2A3039] bg-[#12161D] p-4 text-xs text-[#94A3B8]">
                <strong className="text-[#F8FAFC]">No Third-Party Advertising Monetization:</strong> We do not sell, rent, trade, or monetize your personal, fitness, or biometric data to data brokers, ad networks, or external marketing entities.
              </div>
            </section>

            {/* Section 6 */}
            <section id="infrastructure" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Server className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  6. Storage, Hosting & Relevant Third-Party Infrastructure
                </h2>
              </div>
              <p>
                STREN runs on reputable cloud infrastructure providers to ensure high availability, security, and performance.
                Your data is processed and stored by:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F8FAFC] text-xs">Neon Serverless PostgreSQL</span>
                    <span className="rounded bg-[#5BE584]/20 px-2 py-0.5 text-[10px] font-bold text-[#5BE584]">DATABASE</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Primary relational database engine hosting user accounts, workout templates, set logs, and biometrics. Encrypted at rest and in transit.
                  </p>
                </div>

                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F8FAFC] text-xs">Render Cloud Platform</span>
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">BACKEND API</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Hosts the Node.js / Express application server executing business logic, JWT validation, and Socket.IO real-time gateways.
                  </p>
                </div>

                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F8FAFC] text-xs">Vercel Edge Network</span>
                    <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">FRONTEND SPA</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Delivers the client-side React 19 application bundle via global edge distribution with HTTPS enforcement.
                  </p>
                </div>

                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F8FAFC] text-xs">Google Identity Services</span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">OAUTH 2.0</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Provides federated authentication, cryptographic identity verification, and token exchange.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="role-visibility" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Eye className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  7. Role-Based Visibility & History Sharing Consent
                </h2>
              </div>
              <p>
                STREN enforces granular, server-validated access controls based on user roles and explicit athlete consent:
              </p>
              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-5 space-y-3">
                <ul className="list-disc pl-5 space-y-2 text-xs text-[#94A3B8]">
                  <li>
                    <strong className="text-[#F8FAFC]">Assigned Coach Visibility:</strong> When you connect with a coach, they can view the workout routines they have assigned to you, along with your session logs and adherence.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Historical Workout Sharing Consent:</strong> A coach cannot view your past workouts completed prior to the coaching relationship or logged independently unless you explicitly grant <code className="text-[#5BE584]">HistorySharingConsent: GRANTED</code>. You may revoke this consent at any time.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Unassigned Coaches:</strong> Coaches who do not have an active coaching relationship with you have zero access to your workouts, measurements, or activity logs.
                  </li>
                  <li>
                    <strong className="text-[#F8FAFC]">Administrators:</strong> Gym administrators have access to platform rosters for operational support, membership validation, and system maintenance.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section id="security-limitations" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Lock className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  8. Security Safeguards & Honest Technical Limitations
                </h2>
              </div>
              <p>
                We employ standard industry measures to safeguard data against unauthorized access, loss, or misuse:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#94A3B8]">
                <li>Encryption in transit using Transport Layer Security (TLS 1.2 / TLS 1.3 via HTTPS).</li>
                <li>One-way cryptographic password hashing via bcrypt with salt rounds.</li>
                <li>Stateless, expiring JSON Web Tokens (JWT) for authenticated API requests.</li>
                <li>Server-side input validation using Zod schemas and parameterized database queries via Prisma ORM preventing SQL injection.</li>
              </ul>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white block">Honest Technical Limitation Disclaimer</span>
                  <p>
                    While we take reasonable technical precautions, no Internet data transmission or cloud storage system
                    is 100% impenetrable. STREN does not hold SOC 2 or HIPAA certifications, and we cannot guarantee absolute
                    immunity against sophisticated malicious attacks, system faults, or hardware failures. You are responsible
                    for keeping your password confidential and safeguarding your login devices.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="retention" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Calendar className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  9. Data Retention
                </h2>
              </div>
              <p>
                We retain your account profile, workout history, performance telemetry, and measurements for as long as your
                account remains active in order to provide uninterrupted historical progress analysis.
              </p>
              <p className="text-xs text-[#94A3B8]">
                Transient security tokens (such as 6-digit email verification codes and password reset tokens) are automatically
                rendered invalid after their short lifespan (typically 10 to 15 minutes) and purged by our system.
              </p>
            </section>

            {/* Section 10 */}
            <section id="deletion-procedure" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Trash2 className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  10. Account & Data Deletion Requests
                </h2>
              </div>
              <p>
                You have the right to request the deletion of your account and associated personal data at any time.
              </p>

              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5BE584]/20 text-[#5BE584] shrink-0 font-bold text-xs">
                    !
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F8FAFC]">
                      Current Technical Deletion Workflow
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      The current STREN web application interface does not feature an automated, self-serve &ldquo;Delete Account&rdquo;
                      button in user profile settings. To request full account and data removal, please follow our manual administrative process:
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#1E2329] pt-4 space-y-2 text-xs text-[#CBD5E1]">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Send an email to our privacy desk at <PlaceholderBadge label="[PRIVACY_CONTACT_EMAIL: privacy@stren.fit]" field="Privacy Email" /> with the subject line <code>&ldquo;Data Deletion Request - [Your Name]&rdquo;</code>.
                    </li>
                    <li>
                      Send the request from the email address registered with your STREN account so we can verify identity.
                    </li>
                    <li>
                      Specify whether you wish to delete your entire account, or specific data (such as measurement logs or photos).
                    </li>
                    <li>
                      Our administrative engineering team will process your request, terminate active coaching connections, and delete or irreversibly anonymize your database records within <strong>30 days</strong> of identity confirmation.
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="children" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Shield className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  11. Children&apos;s Privacy
                </h2>
              </div>
              <p>
                STREN is intended for adult gym members, student athletes of eligible age, and professional coaches.
                We do not knowingly collect personal or fitness data from individuals under 16 years of age (or the minimum
                legal age in your jurisdiction) without verified parental or legal guardian consent. If we become aware that
                a child has registered without requisite consent, we will promptly delete their account and associated data.
              </p>
            </section>

            {/* Section 12 */}
            <section id="policy-changes" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Layers className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  12. Changes to This Privacy Policy
                </h2>
              </div>
              <p>
                We may revise this Privacy Policy periodically as new platform features, third-party integrations, or legal
                requirements emerge. When changes are made, we will update the &ldquo;Effective Date&rdquo; at the top of this document.
                Continued use of STREN following posted updates constitutes your acceptance of the revised terms.
              </p>
            </section>

            {/* Section 13 */}
            <section id="contact-information" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Mail className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  13. Privacy Contact Information & Publication Placeholders
                </h2>
              </div>
              <p>
                If you have questions, inquiries, or privacy concerns regarding this policy or our data practices, please reach out to us:
              </p>

              {/* Administrative Placeholders Callout Card */}
              <div className="rounded-xl border border-amber-500/30 bg-[#12100A] p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Required Details for Official Release
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Operating Entity:</span>
                    <PlaceholderBadge label="[LEGAL_COMPANY_NAME: STREN Technologies LLC]" field="Official Company Entity" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Privacy & Support Desk:</span>
                    <PlaceholderBadge label="[PRIVACY_CONTACT_EMAIL: privacy@stren.fit]" field="Privacy Email" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Registered Address:</span>
                    <PlaceholderBadge label="[BUSINESS_ADDRESS: 100 Fitness Way, Suite 400, New York, NY 10001]" field="Corporate Physical Address" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Governing Jurisdiction:</span>
                    <PlaceholderBadge label="[GOVERNING_JURISDICTION: State of Delaware, USA]" field="Legal Jurisdiction" />
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/80 pt-2 border-t border-amber-500/20">
                  Please update the placeholder constants above with your verified business entity and support contact inbox prior to public marketing.
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>

      <LegalFooter />
    </div>
  );
}
