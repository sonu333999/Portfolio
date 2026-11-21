import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import React, { useState } from 'react';
import { sanitizeHref } from '../lib/firebase';
import { submitInquiry } from '../services/portfolioService';
import {
  BLUEPRINT_LIMITS,
  INQUIRY_TYPES,
  type InquiryType,
  type PortfolioProfile,
} from '../types/portfolio';

interface ContactSectionProps {
  profile: PortfolioProfile;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType>('Collaboration');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const githubHref = sanitizeHref(profile.githubUrl);
  const linkedinHref = sanitizeHref(profile.linkedinUrl);
  const behanceHref = sanitizeHref(profile.behanceUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const validateRes = await fetch('/api/validate-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderEmail,
          inquiryType,
          subject,
          message,
        }),
      });

      const validationData = (await validateRes.json()) as {
        valid?: boolean;
        error?: string;
        sanitized?: {
          senderName: string;
          senderEmail: string;
          inquiryType: InquiryType;
          subject: string;
          message: string;
        };
      };

      if (!validateRes.ok || !validationData.valid || !validationData.sanitized) {
        setErrorMsg(validationData.error || 'Please check the form fields and try again.');
        return;
      }

      await submitInquiry(validationData.sanitized);
      setSubmitted(true);
      setSenderName('');
      setSenderEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to send your message right now. Please email directly.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Coordinates */}
          <div className="lg:col-span-5">
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-3">
              05. Contact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance mb-4">
              Start a conversation
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 mb-8 max-w-md">
              Open to internships, frontend & UI/UX engineering collaborations, and applied AI/ML
              projects. Messages are saved directly to the portfolio inbox.
            </p>

            <div className="space-y-5 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Email</p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Phone</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Location</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {profile.location}
                  </p>
                </div>
              </div>

              {(githubHref || linkedinHref || behanceHref) && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-5">
                  {githubHref && (
                    <a
                      href={githubHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      GitHub
                    </a>
                  )}
                  {linkedinHref && (
                    <a
                      href={linkedinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      LinkedIn
                    </a>
                  )}
                  {behanceHref && (
                    <a
                      href={behanceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Behance
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Validated Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {submitted ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">
                    Message received
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-6">
                    Thank you for reaching out. Your inquiry has been delivered to Sonu Khajotiya’s
                    portfolio inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.inquiry.senderNameMax}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={BLUEPRINT_LIMITS.inquiry.senderEmailMax}
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-type"
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Topic
                      </label>
                      <select
                        id="contact-type"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value as InquiryType)}
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {INQUIRY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.inquiry.subjectMax}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief subject"
                        className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      maxLength={BLUEPRINT_LIMITS.inquiry.messageMax}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details about your project, internship opportunity, or question..."
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Direct delivery to {profile.email}
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
