import React, { useState, useEffect, useRef } from 'react';
import { AxiosError } from 'axios';
import { userApi } from '../../api/user.api';
import type { User } from '../../types/user.type';
import { ChatAvatar } from '../ChatAvatar';
import { useAuthStore } from '../../store/auth.store';

interface SearchUsersResponse {
  users: User[];
}

interface SearchUserProps {
  onSelectUser: (user: User) => void;
}

export const SearchUser: React.FC<SearchUserProps> = ({ onSelectUser }) => {
  const { user: currentUser } = useAuthStore();
  const [query, setQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('chat_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: User) => {
    const updatedRecents = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('chat_recent_searches', JSON.stringify(updatedRecents));
    
    onSelectUser(user);
    setQuery('');
    setUsers([]);
    setIsFocused(false);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await userApi.searchUsers(value);
      const allUsers = (res.data as unknown as { data?: SearchUsersResponse }).data?.users || [];
      setUsers(allUsers.filter(u => u._id !== currentUser?._id));
    } catch (err: unknown) {
      if (err instanceof AxiosError) console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="search-user-input"
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-[14px] text-slate-700 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400 font-medium"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {(users.length > 0 || (isFocused && recentSearches.length > 0 && query.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto custom-scrollbar p-1.5">
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="px-2 py-1.5 text-[12px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Lịch sử tìm kiếm</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setRecentSearches([]);
                  localStorage.removeItem('chat_recent_searches');
                }}
                className="hover:text-red-500 transition-colors"
              >
                Xóa
              </button>
            </div>
          )}
          <ul className="space-y-0.5">
            {(query.length === 0 ? recentSearches : users).map(user => (
              <li
                key={user._id}
                id={`search-result-${user._id}`}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="shrink-0 ring-1 ring-slate-100 rounded-[10px] overflow-hidden">
                  <ChatAvatar avatarUrl={user.avatar} fullName={user.fullName} size={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-slate-800 truncate">{user.fullName}</div>
                  <div className="text-[12px] text-slate-500 truncate">{user.email}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};