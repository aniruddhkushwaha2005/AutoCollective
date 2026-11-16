import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  ShieldCheck,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type AnyStatus = string;

export const StatusBadge: React.FC<{ status: AnyStatus }> = ({ status }) => {
  const getConfig = (s: string) => {
    switch (s) {
      case 'Collecting Buyers':
      case 'Pending Match':
      case 'Intention Confirmed':
        return {
          cls: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]',
          icon: Clock,
        };
      case 'Ready for Negotiation':
      case 'Matched to Group':
      case 'Dealer Assigned':
        return {
          cls: 'bg-[#FEF3C7]/70 text-[#92400E] border-[#FDE68A]',
          icon: ShieldCheck,
        };
      case 'Negotiating':
      case 'Booking Paid':
      case 'Vehicle Allocated':
        return {
          cls: 'bg-[#E0F2FE]/80 text-[#075985] border-[#BAE6FD]',
          icon: Handshake,
        };
      case 'Offer Received':
      case 'Published':
        return {
          cls: 'bg-[#EBF3F0] text-[#176B50] border-[#BFE0D4]',
          icon: FileText,
        };
      case 'Deal Completed':
      case 'Delivered':
      case 'Purchase Confirmed':
      case 'Active':
      case 'Verified':
        return {
          cls: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
          icon: CheckCircle2,
        };
      case 'Draft':
        return {
          cls: 'bg-[#F4F4F0] text-[#5A5F6B] border-[#E4E4E0]',
          icon: FileText,
        };
      case 'Expired':
        return {
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle,
        };
      case 'Cancelled':
      case 'Inactive':
        return {
          cls: 'bg-red-50 text-red-700 border-red-200',
          icon: XCircle,
        };
      default:
        return {
          cls: 'bg-[#F4F4F0] text-[#374151] border-[#E4E4E0]',
          icon: Clock,
        };
    }
  };

  const { cls, icon: Icon } = getConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap shrink-0 ${cls}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
