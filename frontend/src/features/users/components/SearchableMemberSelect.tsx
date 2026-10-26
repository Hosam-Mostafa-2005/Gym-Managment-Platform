// src/features/users/components/SearchableMemberSelect.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { User, Search, Check, ChevronDown, Lock, X } from "lucide-react";
import { formatMemberDisplay, type MemberDisplayInfo } from "../utils/user-display";

interface SearchableMemberSelectProps {
  value: string;
  onChange: (memberId: string) => void;
  members: any[];
  preselectedMember?: any;
  disabled?: boolean;
  locked?: boolean;
  placeholder?: string;
  error?: string;
  label?: string;
}

export const SearchableMemberSelect: React.FC<SearchableMemberSelectProps> = ({
  value,
  onChange,
  members = [],
  preselectedMember,
  disabled = false,
  locked = false,
  placeholder = "Choose an athlete...",
  error,
  label = "Select Member",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format and memoize all members, ensuring preselected athlete is preserved
  const formattedMembers: MemberDisplayInfo[] = useMemo(() => {
    const list = members.map((m) => formatMemberDisplay(m));
    if (preselectedMember) {
      const preInfo = formatMemberDisplay(preselectedMember);
      if (preInfo.id && !list.some((m) => m.id === preInfo.id)) {
        list.unshift(preInfo);
      }
    }
    return list;
  }, [members, preselectedMember]);

  // Selected member info
  const selectedMember = useMemo(() => {
    if (!value) return null;
    const found = formattedMembers.find((m) => m.id === value);
    if (found) return found;

    if (preselectedMember) {
      const preInfo = formatMemberDisplay(preselectedMember);
      if (preInfo.id === value) return preInfo;
    }

    return formatMemberDisplay({ id: value });
  }, [value, formattedMembers, preselectedMember]);

  // Filtered members based on search term
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return formattedMembers;
    const q = search.toLowerCase();
    return formattedMembers.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.displayEmail.toLowerCase().includes(q),
    );
  }, [formattedMembers, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Locked/Preselected state from member profile
  if (locked && selectedMember) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
          <User className="w-3.5 h-3.5 text-[#5BE584]" />
          <span>{label}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-[#5BE584] font-medium bg-[#5BE584]/10 border border-[#5BE584]/20 px-2 py-0.5 rounded-full lowercase">
            <Lock className="w-2.5 h-2.5" />
            preselected from profile
          </span>
        </label>
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#12161D] border border-[#23422E] shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] font-bold text-xs">
              {selectedMember.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-white truncate">
                {selectedMember.displayName}
              </div>
              {selectedMember.displayEmail ? (
                <div className="text-xs text-gray-400 truncate">
                  {selectedMember.displayEmail}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
        <User className="w-3.5 h-3.5 text-[#5BE584]" />
        <span>{label} *</span>
      </label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#12161D] border text-left text-xs transition-all ${
            error
              ? "border-rose-500/50 focus:border-rose-500"
              : isOpen
                ? "border-[#5BE584] ring-1 ring-[#5BE584]"
                : "border-[#1E2329] hover:border-[#2A313C]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {selectedMember ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#16291D] text-[#5BE584] font-bold text-[10px]">
                {selectedMember.avatarInitials}
              </div>
              <span className="font-semibold text-white truncate">
                {selectedMember.displayName}
              </span>
              {selectedMember.displayEmail ? (
                <span className="text-gray-400 text-[11px] truncate hidden sm:inline">
                  ({selectedMember.displayEmail})
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180 text-[#5BE584]" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#0D1014] border border-[#1E2329] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-2 border-b border-[#1E2329] bg-[#12161D]/60 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-gray-500 hover:text-white p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto p-1 divide-y divide-[#1E2329]/40">
              {filteredMembers.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  {search
                    ? `No athletes found matching "${search}"`
                    : "No assigned members available."}
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = m.id === value;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange(m.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-[#16291D] text-[#5BE584]"
                          : "hover:bg-[#161B22] text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-xs ${
                            isSelected
                              ? "bg-[#5BE584] text-black"
                              : "bg-[#1E2329] text-gray-300"
                          }`}
                        >
                          {m.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-white truncate">
                            {m.displayName}
                          </div>
                          {m.displayEmail ? (
                            <div className="text-[11px] text-gray-400 truncate">
                              {m.displayEmail}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#5BE584] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};
