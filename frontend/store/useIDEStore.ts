import { create } from 'zustand';

export interface IDEState {
  language: string;
  code: string;
  isExecuting: boolean;
  activeTab: 'problem' | 'submissions' | 'solutions' | 'discussion';
  setLanguage: (lang: string) => void;
  setCode: (code: string) => void;
  setIsExecuting: (executing: boolean) => void;
  setActiveTab: (tab: 'problem' | 'submissions' | 'solutions' | 'discussion') => void;
}

const DEFAULT_CODE: Record<string, string> = {
  python: `class Solution:\n    def solve(self):\n        # Write your code here\n        pass\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n`,
  javascript: `function solve() {\n  // Write your code here\n}\n`,
  java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`,
};

export const useIDEStore = create<IDEState>()((set) => ({
  language: 'python',
  code: DEFAULT_CODE['python'],
  isExecuting: false,
  activeTab: 'problem',
  setLanguage: (language: string) => 
    set((state: IDEState) => ({
      language,
      code: DEFAULT_CODE[language] || state.code,
    })),
  setCode: (code: string) => set({ code }),
  setIsExecuting: (isExecuting: boolean) => set({ isExecuting }),
  setActiveTab: (activeTab: 'problem' | 'submissions' | 'solutions' | 'discussion') => set({ activeTab }),
}));
