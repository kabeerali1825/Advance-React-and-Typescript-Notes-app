// src/App.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import { NewNote } from "./Components/NewNote";
import { useLocalStorage } from "./Components/UseLocalStorage";
import { useMemo } from "react";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./Components/NoteList";
import NoteLayout from "./Components/NoteLayout";
import Note from "./Components/Note";
import { EditNote } from "./Components/EditNote";

export type Note = {
  id: string;
} & NoteData;

export type RawNote = {
  id: string;
} & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  label: string;
};

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  const notesWithTags = useMemo(() => {
    return notes.map(note => {
      return { ...note, tags: tags.filter(tag => note.tagIds.includes(tag.id)) };
    });
  }, [notes, tags]);

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes(prevNotes => [
      ...prevNotes,
      { ...data, id: uuidV4(), tagIds: tags.map(tag => tag.id) }
    ]);
  }

  function onAddTag(newTag: Tag) {
    setTags(prevTags => [...prevTags, newTag]);
  }
  function onDeleteNote(id: string) {
    setNotes(prevNotes => {
      return prevNotes.filter(notes=>notes.id!==id)
  })
  }
  
  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes(prevNotes => {
      return prevNotes.map(notes => {
        if (notes.id === id) {
          return {
      ...notes,...data, tagIds: tags.map(tag => tag.id) }
          
        }
        else return notes;
      })
    })
  }
    function updateTag(id: string, label: string) {
    setTags(prevTags => {
      return prevTags.map(tag => {
        if (tag.id === id) {
          return { ...tag, label }
        } else {
          return tag
        }
      })
    })
  }

  function deleteTag(id: string) {
    setTags(prevTags => {
      return prevTags.filter(tag => tag.id !== id)
    })
  }
  return (
    <Container className="my-4">
      <Routes>
        <Route path="/" element={<NoteList notes={notesWithTags} availableTags={tags} onUpdateTag={updateTag}
        onDeleteTag={deleteTag} />} />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={onAddTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags}></NoteLayout>}>
          <Route index element={<Note onDelete={onDeleteNote} />} />
          <Route path="edit" element={
            <EditNote
              onSubmit={onUpdateNote}
              onAddTag={onAddTag}
              availableTags={tags}
            />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  );
}

export default App;
