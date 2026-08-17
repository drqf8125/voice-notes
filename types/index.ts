export interface TodoItem {
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  list_id: string | null;
  summary: string;
  transcript: string;
  todos: TodoItem[];
  tags: string[];
  done: boolean;
  created_at: string;
}


export interface List {
  id: string;
  name: string;
  user_id: string;
}

export interface TranscriptionResult {
  text: string;
  summary: string;
  todos: string[];
}
