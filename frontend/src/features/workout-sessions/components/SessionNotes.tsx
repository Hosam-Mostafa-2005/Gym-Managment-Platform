import { FileText } from "lucide-react";

interface SessionNotesProps {
  notes?: string;
}

export default function SessionNotes({ notes }: SessionNotesProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <FileText size={18} className="text-[#9CA3AF]" />
        <h2 className="text-lg font-bold text-white tracking-tight">
          Session Notes
        </h2>
      </div>

      <div className="bg-[#11151B] border border-white/5 rounded-2xl p-6 shadow-sm">
        {notes ? (
          <p className="leading-relaxed text-[#D1D5DB] whitespace-pre-wrap">
            {notes}
          </p>
        ) : (
          <p className="text-[#9CA3AF] italic">
            No notes available for this session.
          </p>
        )}
      </div>
    </section>
  );
}
