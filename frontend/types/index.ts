export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Verdict = 
  | 'ACCEPTED' 
  | 'WRONG_ANSWER' 
  | 'TIME_LIMIT_EXCEEDED' 
  | 'MEMORY_LIMIT_EXCEEDED' 
  | 'COMPILATION_ERROR' 
  | 'RUNTIME_ERROR' 
  | 'PENDING';

export interface Testcase {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface Question {
  id: string;
  title: string;
  title_slug: string;
  description: string;
  difficulty: Difficulty;
  constraints: string[];
  input_format: string;
  output_format: string;
  sample_cases: Testcase[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  question_id: string;
  language: string;
  code: string;
  verdict: Verdict;
  execution_time_ms?: number;
  memory_kb?: number;
  error_message?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  role: 'ADMIN' | 'LEARNER';
  solved_count: number;
}
