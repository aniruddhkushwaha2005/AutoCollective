import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const ContactPage: React.FC = () => {
  const { db, submitContactMessage, currentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [subject, setSubject] = useState('Buyer Group Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email, and message.');
      return;
    }
    const res = submitContactMessage({ name, email, phone, city, subject, message });
    if (res.ok) {
      setSubmitted(true);
      setMessage('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#17191D] font-display">Contact Us</h1>
            <p className="text-sm text-[#5A5F6B] mt-2 leading-relaxed">
              Questions about an active city group, dealership onboarding, or quotation verification?
              Send a message directly to our coordination desk.
            </p>
          </div>

          <div className="bg-white border border-[#E4E4E0] rounded-xl p-6 space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#176B50] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#17191D]">Email Support</p>
                <p className="text-[#5A5F6B]">{db.settings.supportEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#176B50] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#17191D]">Coordination Desk</p>
                <p className="text-[#5A5F6B] tabular-nums">{db.settings.supportPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#176B50] mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-[#17191D]">Operations Office</p>
                <p className="text-[#5A5F6B]">
                  Connaught Place, New Delhi & Regional Hubs in Bareilly, Lucknow, Jaipur
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#176B50] mx-auto" />
              <h2 className="text-xl font-bold text-[#17191D] font-display">
                Message Received
              </h2>
              <p className="text-sm text-[#5A5F6B] max-w-md mx-auto">
                Thank you for contacting AutoCollective. Your inquiry has been logged for our team.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 text-xs font-semibold text-[#176B50] border border-[#176B50] rounded-lg"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-[#17191D] font-display">Send an Inquiry</h2>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cnt-name" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="cnt-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="cnt-email" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="cnt-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cnt-phone" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="cnt-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="cnt-city" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                    City
                  </label>
                  <input
                    id="cnt-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Bareilly"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cnt-subject" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                  Topic
                </label>
                <select
                  id="cnt-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                >
                  <option value="Buyer Group Inquiry">Buyer Group Inquiry</option>
                  <option value="Dealership Partnership">Dealership Partnership</option>
                  <option value="Quotation Clarification">Quotation Clarification</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div>
                <label htmlFor="cnt-msg" className="block text-xs font-semibold text-[#17191D] mb-1.5">
                  Message
                </label>
                <textarea
                  id="cnt-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details of your car requirement or dealership query..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
