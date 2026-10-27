// src/features/legal/pages/TermsOfServicePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  UserCheck,
  Ban,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
  Mail,
  Dumbbell,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { LegalNavbar } from "../components/LegalNavbar";
import { LegalFooter } from "../components/LegalFooter";
import { PlaceholderBadge } from "../components/PlaceholderBadge";

const TOC_SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "platform-description", title: "2. Platform Description" },
  { id: "eligibility-accounts", title: "3. Eligibility & Account Security" },
  { id: "health-disclaimer", title: "4. Medical & Exercise Disclaimer" },
  { id: "acceptable-use", title: "5. Acceptable Use & Conduct" },
  { id: "coaching-standards", title: "6. Coach & Athlete Interactions" },
  { id: "intellectual-property", title: "7. Intellectual Property & User Data" },
  { id: "suspension-termination", title: "8. Suspension & Account Termination" },
  { id: "warranty-disclaimer", title: "9. Disclaimer of Warranties" },
  { id: "limitation-liability", title: "10. Limitation of Liability" },
  { id: "indemnification", title: "11. Indemnification" },
  { id: "governing-law", title: "12. Governing Law & Dispute Resolution" },
  { id: "terms-contact", title: "13. Contact & Placeholders" },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

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
              <Scale className="h-3.5 w-3.5" />
              <span>STREN PLATFORM AGREEMENT</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F8FAFC]">
              Terms of Service
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Please read these Terms of Service carefully before utilizing the STREN Gym Management Platform.
              They establish the legally binding terms and conditions governing your access and usage of our platform.
            </p>

            {/* Document Metadata Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-[#2A3039]/80 pt-4 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#5BE584]" />
                <span>Effective Date: <strong>October 28, 2026</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span>Applies to: <strong>All Registered Accounts & Visitors</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5 text-red-400" />
                <span>Includes: <strong>Mandatory Exercise & Health Risk Release</strong></span>
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
            <strong>Administrator Notice:</strong> Highlighted tokens such as{" "}
            <PlaceholderBadge label="[LEGAL_COMPANY_NAME]" field="Corporate Entity Name" /> represent
            placeholders that must be populated with your official registered legal entity and jurisdiction
            prior to formal commercial publication.
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

            <nav aria-label="Terms Table of Contents" className="space-y-1">
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
              <span className="text-[11px] text-[#94A3B8]">Reviewing Privacy Policies?</span>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584] hover:underline"
              >
                <span>Read Privacy Policy</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Document Body */}
          <article className="flex-1 max-w-3xl space-y-14 text-sm text-[#CBD5E1] leading-relaxed">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Scale className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  1. Acceptance of Terms
                </h2>
              </div>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
                (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and{" "}
                <PlaceholderBadge label="[LEGAL_COMPANY_NAME: STREN Gym Management Platform LLC]" field="Company Name" />{" "}
                (&ldquo;STREN,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              </p>
              <p>
                By registering for an account, accessing, or utilizing any portion of the STREN platform, you confirm that you
                are at least 18 years old (or the age of majority in your jurisdiction), have the legal capacity to enter into
                this agreement, and agree to be bound by these Terms and our{" "}
                <Link to="/privacy-policy" className="text-[#5BE584] hover:underline font-medium">
                  Privacy Policy
                </Link>
                . If you do not agree, you must immediately discontinue your use of STREN.
              </p>
            </section>

            {/* Section 2 */}
            <section id="platform-description" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Dumbbell className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  2. Description of the Platform
                </h2>
              </div>
              <p>
                STREN is a software-as-a-service (SaaS) web application designed for strength coaches, personal trainers, gym
                operators, and individual athletes. The platform provides tools for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#94A3B8]">
                <li>Exercise library creation, categorization, and search.</li>
                <li>Workout routine design, target load prescription (weight and RPE), and assignment.</li>
                <li>Live, in-gym workout execution, set logging, benchmark comparison, and in-session exercise swapping.</li>
                <li>Body measurement recording, biometric trend logging, and progress photo tracking.</li>
                <li>Coaching calendar scheduling, nutrition target tracking, and real-time event notifications.</li>
              </ul>
              <p className="text-xs text-[#94A3B8]">
                STREN functions strictly as a technological enablement platform and software conduit between coaches and athletes.
                We do not employ personal trainers as our agents, nor do we directly supervise physical training sessions.
              </p>
            </section>

            {/* Section 3 */}
            <section id="eligibility-accounts" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <UserCheck className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  3. Eligibility & Account Security
                </h2>
              </div>
              <p>
                To access features of the platform, you must register for an account. By registering, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#94A3B8]">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain and promptly update your profile information.</li>
                <li>Maintain the strict confidentiality of your authentication credentials (password, session JWTs, or Google accounts).</li>
                <li>Accept full responsibility for all activities, workout logs, and communications originating from your account.</li>
                <li>Never share, transfer, or resell access to your personal account credentials with third parties.</li>
              </ul>
              <p className="text-xs text-[#94A3B8]">
                You must notify us immediately at <PlaceholderBadge label="[SUPPORT_CONTACT_EMAIL: support@stren.fit]" field="Support Email" />{" "}
                if you suspect or discover any unauthorized security breach or compromise of your account credentials.
              </p>
            </section>

            {/* Section 4 - Crucial Medical Disclaimer */}
            <section id="health-disclaimer" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <HeartPulse className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  4. Crucial Health, Medical & Exercise Disclaimer
                </h2>
              </div>

              {/* High-Impact Medical Callout Card */}
              <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/[0.07] p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-red-400">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Important Health & Safety Warning — Read Before Training
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-red-100/90 leading-relaxed">
                  <p>
                    <strong>1. Not Medical or Healthcare Advice:</strong> STREN is a technology software platform for tracking
                    training and facilitating coaching communications. <strong>STREN IS NOT A MEDICAL PROVIDER, HEALTHCARE FACILITY,
                    OR EMERGENCY HEALTH SERVICE.</strong> Nothing contained in our platform, exercises, workout routines, target loads,
                    RPE recommendations, or nutrition plans constitutes medical, physiological, or therapeutic diagnosis or advice.
                  </p>
                  <p>
                    <strong>2. Inherent Physical Risks:</strong> Resistance training, barbell lifting, cardiovascular conditioning,
                    and intense physical exercise carry inherent, non-trivial risks of severe bodily injury, permanent disability,
                    cardiovascular events (including heart attacks), musculoskeletal strain, and death.
                  </p>
                  <p>
                    <strong>3. Mandatory Physician Consultation:</strong> You must consult a licensed physician or medical professional
                    before initiating any physical training program, lifting prescribed weights, altering nutritional habits, or
                    executing routines suggested by a coach on STREN. If you feel faint, dizzy, nauseous, or experience chest pain
                    or severe joint discomfort at any point during training, <strong>STOP IMMEDIATELY</strong> and seek emergency medical care.
                  </p>
                  <p>
                    <strong>4. Voluntary Assumption of Risk:</strong> You explicitly acknowledge and voluntarily assume all known and
                    unknown risks associated with executing workouts recorded or prescribed on STREN. You agree that your participation
                    is entirely at your own risk and discretion.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Ban className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  5. Acceptable Use & Conduct Policy
                </h2>
              </div>
              <p>
                You agree to use STREN solely for legitimate strength coaching, personal workout tracking, and fitness management.
                You expressly agree NOT to:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-3.5 space-y-1">
                  <span className="font-semibold text-red-400 block">Prohibited: System Exploitation</span>
                  <span className="text-[#94A3B8]">
                    Attempting to probe, scan, or test the vulnerability of our APIs, servers, or database without prior written consent.
                  </span>
                </div>
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-3.5 space-y-1">
                  <span className="font-semibold text-red-400 block">Prohibited: Reverse Engineering</span>
                  <span className="text-[#94A3B8]">
                    Decompiling, disassembling, or reverse engineering any part of the STREN application, database schema, or algorithms.
                  </span>
                </div>
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-3.5 space-y-1">
                  <span className="font-semibold text-red-400 block">Prohibited: Automated Scraping</span>
                  <span className="text-[#94A3B8]">
                    Deploying automated scrapers, bots, or crawlers to extract workout templates, member rosters, or platform assets.
                  </span>
                </div>
                <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-3.5 space-y-1">
                  <span className="font-semibold text-red-400 block">Prohibited: Abusive Communication</span>
                  <span className="text-[#94A3B8]">
                    Transmitting defamatory, harassing, sexually explicit, hateful, or abusive messages, notes, or reviews between users.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="coaching-standards" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  6. Coach & Athlete Interactions & Standards
                </h2>
              </div>
              <p>
                Coaching relationships established through STREN are built on mutual trust and professional integrity:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <strong className="text-[#F8FAFC]">Accurate Qualifications:</strong> Coaches must accurately represent their professional certifications, specialties, and coaching experience. Misrepresentation of certified personal trainer credentials constitutes grounds for immediate account termination.
                </li>
                <li>
                  <strong className="text-[#F8FAFC]">Safe Prescription Principles:</strong> Coaches agree to design training programs appropriate to their clients&apos; stated fitness level, medical clearances, and reported fatigue levels.
                </li>
                <li>
                  <strong className="text-[#F8FAFC]">Respect for Athlete Consent:</strong> Coaches must honor member consent preferences regarding workout history sharing and biometric visibility. Coaches may not export, distribute, or publish an athlete&apos;s physical measurements or logs without explicit authorization.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="intellectual-property" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Layers className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  7. Intellectual Property & User Data
                </h2>
              </div>
              <p>
                <strong>STREN Proprietary Rights:</strong> The STREN software, UI layouts, interactive previews, branding, logos,
                domain names, taxonomy structures, volume algorithms, and code are the exclusive intellectual property of{" "}
                <PlaceholderBadge label="[LEGAL_COMPANY_NAME]" field="Company Name" /> and its licensors.
              </p>
              <p>
                <strong>User Content License:</strong> You retain ownership of the workout data, biometric measurements, and notes
                that you submit to the platform. By entering content into STREN, you grant us a worldwide, non-exclusive, royalty-free
                license to host, store, process, display, and calculate telemetry on such content solely for the purpose of operating
                the platform on your behalf.
              </p>
            </section>

            {/* Section 8 */}
            <section id="suspension-termination" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <ShieldAlert className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  8. Suspension & Account Termination
                </h2>
              </div>
              <p>
                We reserve the right, in our sole and reasonable discretion, to suspend, deactivate, or terminate your account and
                access to STREN immediately, without prior notice, if:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#94A3B8]">
                <li>You breach any material term or condition of these Terms or the Acceptable Use Policy.</li>
                <li>We determine your conduct threatens the security, integrity, or availability of the platform or other users.</li>
                <li>You engage in fraudulent, defamatory, or abusive behavior toward athletes, coaches, or staff.</li>
                <li>Required by law, regulatory authority, or legal process.</li>
              </ul>
              <p className="text-xs text-[#94A3B8]">
                You may also request voluntary termination of your account at any time by following the deletion procedure outlined
                in our Privacy Policy.
              </p>
            </section>

            {/* Section 9 */}
            <section id="warranty-disclaimer" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <AlertCircle className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  9. Disclaimer of Warranties
                </h2>
              </div>
              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 text-xs text-[#94A3B8] uppercase leading-relaxed font-mono">
                THE STREN PLATFORM IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND,
                WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY LAW, STREN DISCLAIMS ALL WARRANTIES,
                INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT WORKOUT TARGETS WILL PRODUCE SPECIFIC PHYSICAL RESULTS.
              </div>
            </section>

            {/* Section 10 */}
            <section id="limitation-liability" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Scale className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  10. Limitation of Liability
                </h2>
              </div>
              <div className="rounded-xl border border-[#2A3039] bg-[#101418] p-4 text-xs text-[#94A3B8] uppercase leading-relaxed font-mono">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL STREN, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA LOSS, PHYSICAL INJURY,
                OR WRONGFUL DEATH) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE PLATFORM. IN NO EVENT SHALL STREN&apos;S
                TOTAL AGGREGATE LIABILITY EXCEED THE GREATER OF FIFTY US DOLLARS ($50.00 USD) OR THE AMOUNT YOU PAID TO STREN IN THE PAST TWELVE MONTHS.
              </div>
            </section>

            {/* Section 11 */}
            <section id="indemnification" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  11. Indemnification
                </h2>
              </div>
              <p>
                You agree to defend, indemnify, and hold harmless STREN, its affiliates, directors, officers, employees, and licensors
                from and against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable
                attorneys&apos; fees) arising out of or relating to your violation of these Terms, your use of the platform, your physical
                training activities, or any content you submit.
              </p>
            </section>

            {/* Section 12 */}
            <section id="governing-law" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Scale className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  12. Governing Law & Dispute Resolution
                </h2>
              </div>
              <p>
                These Terms and any dispute arising out of or related to your use of STREN shall be governed by and construed in
                accordance with the laws of <PlaceholderBadge label="[GOVERNING_JURISDICTION: State of Delaware, USA]" field="Jurisdiction" />,
                without regard to conflict of law principles. Any legal suit, action, or proceeding shall be instituted exclusively in the
                courts located in <PlaceholderBadge label="[COURT_VENUE: New Castle County, Delaware]" field="Court Venue" />.
              </p>
            </section>

            {/* Section 13 */}
            <section id="terms-contact" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2 text-[#5BE584]">
                <Mail className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  13. Contact Information & Legal Placeholders
                </h2>
              </div>
              <p>
                If you have questions, notices, or require assistance regarding these Terms, please contact our administrative team:
              </p>

              {/* Administrative Placeholders Callout Card */}
              <div className="rounded-xl border border-amber-500/30 bg-[#12100A] p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Official Business Entity Placeholders
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Company Legal Entity:</span>
                    <PlaceholderBadge label="[LEGAL_COMPANY_NAME: STREN Technologies LLC]" field="Official Legal Name" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Legal Notice Contact:</span>
                    <PlaceholderBadge label="[LEGAL_CONTACT_EMAIL: legal@stren.fit]" field="Legal Notice Email" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Registered Address:</span>
                    <PlaceholderBadge label="[BUSINESS_ADDRESS: 100 Fitness Way, Suite 400, New York, NY 10001]" field="Corporate Physical Address" />
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block mb-1">Customer Support Desk:</span>
                    <PlaceholderBadge label="[SUPPORT_CONTACT_EMAIL: support@stren.fit]" field="Support Email" />
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/80 pt-2 border-t border-amber-500/20">
                  Please replace all placeholder constants above with your verified corporate registration, official support email, and legal notice contact prior to final deployment.
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
