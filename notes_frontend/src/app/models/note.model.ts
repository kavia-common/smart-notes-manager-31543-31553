export interface Note {
  id: string;
  title: string;
  content: string;
  starred: boolean;
  trashed: boolean;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}
