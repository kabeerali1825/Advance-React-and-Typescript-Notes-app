import { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, FormGroup, Modal, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactSelect from "react-select";
import { Tag } from "../App";
import styles from "../Components/NoteList.module.css";

type SimplifiedNote = {
  tags: Tag[];
  title: string;
  id: string;
  attachments?: string[]; // Add attachments
};

type NoteListProp = {
  availableTags: Tag[];
  notes: SimplifiedNote[];
  onDeleteTag: (id: string) => void;
  onUpdateTag: (id: string, label: string) => void;
};

type EditTagsModalProps = {
  show: boolean;
  availableTags: Tag[];
  handleClose: () => void;
  onDeleteTag: (id: string) => void;
  onUpdateTag: (id: string, label: string) => void;
};

export function NoteList({ availableTags, notes, onUpdateTag, onDeleteTag }: NoteListProp) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState("");
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      return (
        (title === "" || note.title.toLowerCase().includes(title.toLowerCase())) &&
        (selectedTags.length === 0 || selectedTags.every(tag =>
          note.tags.some(noteTag => noteTag.id === tag.id)
        ))
      );
    });
  }, [title, selectedTags, notes]);

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col><h1>Notes Taking App</h1></Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            <Link to="/new">
              <Button variant="primary">Create</Button>
            </Link>
            <Button onClick={() => setEditTagsModalIsOpen(true)} variant="outline-secondary">
              Edit Tags
            </Button>
          </Stack>
        </Col>
      </Row>

      <Form>
        <Row className="mb-4">
          <Col>
            <FormGroup controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} />
            </FormGroup>
          </Col>
          <Form.Group controlId="tags">
            <Form.Label>Tags</Form.Label>
            <ReactSelect
              value={selectedTags.map(tag => ({
                label: tag.label,
                value: tag.id
              }))}
              options={availableTags.map(tag => ({
                label: tag.label,
                value: tag.id
              }))}
              onChange={tags => {
                setSelectedTags(tags.map(tag => ({
                  label: tag.label,
                  id: tag.value
                })));
              }}
              isMulti
            />
          </Form.Group>
        </Row>
      </Form>

      <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
        {filteredNotes.map(note => (
          <Col key={note.id}>
            <NoteCard
              id={note.id}
              title={note.title}
              tags={note.tags}
              attachments={note.attachments} // Pass attachments to NoteCard
            />
          </Col>
        ))}
      </Row>

      <EditTagsModal
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        availableTags={availableTags}
      />
    </>
  );
}

function EditTagsModal({
  availableTags,
  handleClose,
  show,
  onDeleteTag,
  onUpdateTag,
}: EditTagsModalProps) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={2}>
            {availableTags.map(tag => (
              <Row key={tag.id}>
                <Col>
                  <Form.Control
                    type="text"
                    value={tag.label}
                    onChange={e => onUpdateTag(tag.id, e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button onClick={() => onDeleteTag(tag.id)} variant="outline-danger">
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function NoteCard({ id, title, tags, attachments }: SimplifiedNote) {
  const images = attachments
    ?.map((key) => {
      const item = localStorage.getItem(key);
      return item?.startsWith("data:image/") ? item : null;
    })
    .filter(Boolean) || [];

  return (
    <Card
      as={Link}
      to={`/${id}`}
      className={`h-100 text-reset text-decoration-none ${styles.card}`}
    >
      <Card.Body>
        <Stack gap={2} className="align-items-center justify-content-center h-100">
          <span className="fs-5">{title}</span>
          {tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="justify-content-center flex-wrap">
              {tags.map((tag) => (
                <Badge className="text-truncate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
          {images.length > 0 && (
            <div>
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src || "path/to/fallback-image.png"}
                  alt={`Attachment ${index + 1}`}
                  style={{ maxWidth: "100%", maxHeight: "100px", margin: "5px" }}
                />
              ))}
            </div>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
