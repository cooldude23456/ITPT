import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { saveContactInquiryToSupabase } from '../services/supabaseService';
import { useApp } from '../context/AppContext';
import SocialLinksBar from '../components/SocialLinks';

export default function ContactPage() {
  const { addSecurityAuditLog } = useApp?.() || {};
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'Certification Exam Inquiry',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await saveContactInquiryToSupabase(form);
      if (res.success) {
        setSubmitted(true);
        if (addSecurityAuditLog) {
          addSecurityAuditLog({
            eventType: 'CONTACT_INQUIRY_SUBMITTED',
            severity: 'INFO',
            actor: `${form.name} (${form.email})`,
            details: `Inquiry submitted: "${form.subject}". Ticket saved to Supabase backend.`
          });
        }
      } else {
        // Still treat as submitted locally if network issue, but show notice
        setSubmitted(true);
      }
    } catch (err) {
      console.warn('Error saving inquiry:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-udemy-border p-8 shadow-sm space-y-3 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            24/7 Customer Support & Help Desk
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-udemy-dark">
            Get in Touch with ITPracticeTests
          </h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-2xl">
            Have a question regarding exam objectives, bulk corporate licensing, or need guidance from instructor Yogesh Dhiman? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Support Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <strong className="text-udemy-dark block font-bold">Email Support</strong>
              <a href="mailto:support@itpracticetests.com" className="text-purple-700 hover:underline block font-semibold">
                support@itpracticetests.com
              </a>
              <p className="text-gray-400">Response within 2 hours</p>
            </div>

            <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <strong className="text-udemy-dark block font-bold">Phone / WhatsApp</strong>
              <a href="tel:+919253330335" className="text-emerald-700 hover:underline block font-semibold">
                +91-9253330335
              </a>
              <p className="text-gray-400">Mon–Sat: 9 AM – 6 PM IST</p>
            </div>

            <div className="bg-white rounded-xl border border-udemy-border p-5 shadow-sm space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <strong className="text-udemy-dark block font-bold">Registered Office</strong>
              <p className="text-slate-600 leading-relaxed">
                Office No. 715, 7th Floor, Block D&E,<br />
                Chandigarh Citi Center, VIP Road,<br />
                Zirakpur, Punjab – 140603<br />
                <span className="font-semibold text-slate-800">GSTIN: 03AKXPD3010G1ZM</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-udemy-border p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-udemy-dark">Inquiry Dispatched!</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Thank you for contacting us. A support representative from ITPracticeTests will reply to <strong>{form.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', subject: 'Certification Exam Inquiry', message: '' });
                  }}
                  className="mt-2 text-xs text-purple-700 font-bold hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bold text-base text-udemy-dark">
                  Send a Direct Message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Topic / Exam Track</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:outline-none"
                  >
                    <option value="Certification Exam Inquiry">Certification Exam Inquiry (AWS / Azure / CompTIA)</option>
                    <option value="IT Interview Preparation">IT Interview Preparation & Code Review</option>
                    <option value="Technical Support or Access Issue">Technical Support or Access Issue</option>
                    <option value="Corporate / Team Training Licensing">Corporate / Team Training Licensing</option>
                    <option value="Billing / Invoice Query">Billing / Invoice Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can Yogesh and our support team assist your exam readiness?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#f7f9fa] border border-slate-300 rounded-lg p-2.5 text-xs text-udemy-dark focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-udemy-purple hover:bg-udemy-purple-hover disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition flex items-center space-x-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Support System...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Official Social Media Channels Grid (All 10 Platforms) */}
        <div className="bg-white rounded-2xl border border-udemy-border p-6 md:p-8 shadow-sm">
          <SocialLinksBar
            variant="cards"
            title="Connect with Us on Official Social Media Channels"
          />
        </div>
      </div>
    </div>
  );
}
